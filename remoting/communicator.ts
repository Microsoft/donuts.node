//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IDictionary } from "../common";
import {
    AsyncRequestHandler,
    ICommunicator,
    IRoutePattern,
    ICommunicatorConstructorOptions,
    IChannelProxy,
    IMessage,
    IRoutePathInfo,
    isChannelProxy
} from ".";

import * as uuidv4 from "uuid/v4";

import * as utils from "../utils";

interface IPromiseResolver {
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}

interface IRoute {
    pattern: IRoutePattern;
    asyncHandler: AsyncRequestHandler;
}

export const UuidNamespace = "65ef6f94-e6c9-4c95-8360-6d29de87b1dd";

export class Communicator implements ICommunicator {
    public readonly id: string;

    public readonly timeout?: number;

    private ongoingPromiseDict: IDictionary<IPromiseResolver>;

    private routes: Array<IRoute>;

    private channelProxy: IChannelProxy;

    constructor(
        channelProxy: IChannelProxy,
        options?: ICommunicatorConstructorOptions) {

        if (!isChannelProxy(channelProxy)) {
            throw new Error("channelProxy must be a IChannelProxy object.");
        }

        this.routes = [];
        this.ongoingPromiseDict = Object.create(null);

        this.id = uuidv4();

        if (options) {
            if (utils.isString(options.id)
                && !utils.string.isEmptyOrWhitespace(options.id)) {
                this.id = options.id;
            }

            if (utils.isNumber(options.timeout)) {
                this.timeout = options.timeout;
            }
        }

        this.channelProxy = channelProxy;
        this.channelProxy.setHandler("data", this.onMessageAsync);
    }

    public map(pattern: IRoutePattern, asyncHandler: AsyncRequestHandler): this {
        this.validateDisposal();

        if (!pattern) {
            throw new Error("pattern must be provided.");
        }

        if (!utils.isFunction(asyncHandler)) {
            throw new Error("asyncHandler must be a function.");
        }

        const route: IRoute = {
            pattern: pattern,
            asyncHandler: asyncHandler
        };

        this.routes.push(route);
        return this;
    }

    public unmap(pattern: IRoutePattern): this {
        this.validateDisposal();

        if (utils.isNullOrUndefined(pattern)) {
            throw new Error("pattern must be supplied.");
        }

        const routeIndex = this.routes.findIndex((route) => route.pattern.equals(pattern));

        if (routeIndex < 0) {
            return undefined;
        }

        const asyncHandler = this.routes[routeIndex].asyncHandler;

        this.routes.splice(routeIndex, 1);

        return this;
    }

    public sendAsync<TRequest, TResponse>(path: string, content: TRequest): Promise<TResponse> {
        this.validateDisposal();

        if (utils.string.isEmptyOrWhitespace(path)) {
            throw new Error("path must be a string and not empty/whitespaces.");
        }

        return new Promise((resolve, reject) => {
            const msg: IMessage = {
                id: uuidv4(),
                path: path,
                body: content
            };

            if (!this.channelProxy.sendData(msg)) {
                reject(new Error("Failed to send request. The remote channel may be closed."));
                return;
            }

            if (this.timeout) {
                setTimeout(
                    (msgId) => {
                        const record = this.ongoingPromiseDict[msg.id];

                        if (!record) {
                            return;
                        }

                        record.reject(new Error(`Communicator-${this.id}: Message, ${msgId}, timed out (${this.timeout}).`));
                    },
                    this.timeout,
                    msg.id);
            }

            this.ongoingPromiseDict[msg.id] = {
                resolve: (result) => resolve(result),
                reject: (error) => reject(error)
            };
        });
    }

    public get disposed(): boolean {
        return this.channelProxy === undefined;
    }

    public async disposeAsync(): Promise<void> {
        if (this.disposed) {
            return;
        }

        await this.channelProxy.disposeAsync();
        Object.values(this.ongoingPromiseDict).forEach((resolver) => resolver.reject(new Error(`Communicator (${this.id}) is disposed.`)));

        this.channelProxy.setHandler("data", undefined);
        this.channelProxy = undefined;
        this.routes = undefined;
        this.ongoingPromiseDict = undefined;
    }

    private validateDisposal(): void {
        if (this.disposed) {
            throw new Error(`Communicator (${this.id}) already disposed.`);
        }
    }

    private onMessageAsync = async (channel: IChannelProxy, msg: IMessage): Promise<void> => {
        const promise = this.ongoingPromiseDict[msg.id];

        if (promise) {
            delete this.ongoingPromiseDict[msg.id];
            msg.succeeded ? promise.resolve(msg.body) : promise.reject(msg.body);

        } else if (utils.isNullOrUndefined(msg.succeeded)) {
            let pathInfo: IRoutePathInfo;
            let asyncHandler: AsyncRequestHandler;

            // Find the corresponding route and
            // generate the pathInfo.
            for (const route of this.routes) {
                asyncHandler = route.asyncHandler;
                pathInfo = route.pattern.match(msg.path);

                if (pathInfo) {
                    break;
                }
            }

            if (!pathInfo) {
                return;
            }

            let response: any;
            let succeeded: boolean;

            try {
                response = await asyncHandler(this, pathInfo, msg.body);
                succeeded = true;
            } catch (exception) {
                response = exception;
                succeeded = false;
            }

            if (!this.channelProxy.sendData({
                id: msg.id,
                path: msg.path,
                succeeded: succeeded,
                body: response
            })) {
                // Log if failed.
            }
        }
    }
}

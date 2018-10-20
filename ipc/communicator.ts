//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IDictionary } from "../common";
import { AsyncRequestHandler, ICommunicator, IRoutePattern } from "../remoting";
import { ICommunicatorConstructorOptions, IChannelProxy, IMessage } from ".";

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

export class Communicator implements ICommunicator {
    public readonly id: string;

    private ongoingPromiseDict: IDictionary<IPromiseResolver>;

    private routes: Array<IRoute>;

    private channelProxy: IChannelProxy;

    constructor(
        channelProxy: IChannelProxy,
        options?: ICommunicatorConstructorOptions) {
        this.routes = [];
        this.ongoingPromiseDict = Object.create(null);

        this.id = uuidv4();

        if (options) {
            if (utils.isString(options.id)
                && !utils.string.isEmptyOrWhitespace(options.id)) {
                this.id = options.id;
            }
        }

        this.channelProxy = channelProxy;
        this.channelProxy.setDataHandler(this.onMessageAsync);
    }

    public map(pattern: IRoutePattern, asyncHandler: AsyncRequestHandler): void {
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
    }

    public unmap(pattern: IRoutePattern): AsyncRequestHandler {
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

        return asyncHandler;
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

        this.channelProxy.setDataHandler(undefined);
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
            const route = this.routes.find((route) => route.pattern.match(msg.path));

            if (route !== undefined) {
                let response: any;
                let succeeded: boolean;

                try {
                    response = await route.asyncHandler(this, msg.path, msg.body);
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
}

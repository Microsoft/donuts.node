//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IDictionary } from "../common";
import {
    ICommunicationHost,
    ICommunicator,
    IConnectionInfo,
    IRoutePattern,
    AsyncRequestHandler,
    IChannelHostProxy,
    ICommunicatorConstructorOptions,
    isChannelHostProxy,
    isRoutePattern,
    ChannelHostProxyConnectionHandler,
    ChannelHostProxyErrorHandler,
    ChannelHostProxyEventHandler
} from ".";

import { EventEmitter } from "events";

import * as utils from "../utils";
import { Communicator } from "./communicator";

interface IRoute {
    pattern: IRoutePattern;
    handler: AsyncRequestHandler;
}

export class CommunicationHost extends EventEmitter implements ICommunicationHost {
    public readonly communicators: IDictionary<ICommunicator>;

    public get connectionInfo(): IConnectionInfo {
        return this.host.connectionInfo;
    }

    private communicatorOptions: ICommunicatorConstructorOptions;

    private host: IChannelHostProxy;

    private routes: Array<IRoute>;

    private get disposed(): boolean {
        return this.host === undefined;
    }

    constructor(host: IChannelHostProxy, options?: ICommunicatorConstructorOptions) {
        super();

        if (!isChannelHostProxy(host)) {
            throw new Error("host must be a IChannelHostProxy object.");
        }

        this.routes = [];
        this.communicators = Object.create(null);
        this.communicatorOptions = options;
        this.host = host;

        this.host.setHandler("close", this.onClose);
        this.host.setHandler("connection", this.onConnection);
        this.host.setHandler("error", this.onError);
        this.host.setHandler("listening", this.onListening);
    }

    public map(pattern: IRoutePattern, asyncHandler: AsyncRequestHandler): this {
        if (this.disposed) {
            throw new Error("Already disposed.");
        }

        if (!isRoutePattern(pattern)) {
            throw new Error("pattern must be a IRoutePattern object.");
        }

        if (!utils.isFunction(asyncHandler)) {
            throw new Error("asyncHandler must be a function");
        }

        const route: IRoute = Object.create(null);

        route.pattern = pattern;
        route.handler = asyncHandler;

        this.routes.push(route);

        for (const communicator of Object.values(this.communicators)) {
            communicator.map(pattern, asyncHandler);
        }

        return this;
    }

    public unmap(pattern: IRoutePattern): this {
        if (this.disposed) {
            throw new Error("Already disposed.");
        }

        if (!isRoutePattern(pattern)) {
            throw new Error("pattern must be a IRoutePattern object.");
        }

        for (let routeIndex = 0; routeIndex < this.routes.length; routeIndex++) {
            const route = this.routes[routeIndex];

            if (route.pattern.equals(pattern)) {
                this.routes.splice(routeIndex, 1);
                break;
            }
        }

        for (const communicator of Object.values(this.communicators)) {
            communicator.unmap(pattern);
        }

        return this;
    }

    public async disposeAsync(): Promise<void> {
        if (this.disposed) {
            return;
        }

        await this.host.disposeAsync();

        this.host.setHandler("close", undefined);
        this.host.setHandler("connection", undefined);
        this.host.setHandler("error", undefined);
        this.host.setHandler("listening", undefined);

        this.host = undefined;
        this.communicatorOptions = undefined;
        this.routes = undefined;

        for (const propName in this.communicators) {
            await this.communicators[propName].disposeAsync();

            delete this.communicators[propName];
        }
    }

    private onConnection: ChannelHostProxyConnectionHandler =
        (hostProxy, channelProxy) => {
            const communicator = new Communicator(channelProxy, this.communicatorOptions);

            for (const route of this.routes) {
                communicator.map(route.pattern, route.handler);
            }

            this.communicators[communicator.id] = communicator;
            this.emit("connection", this, communicator);
        }

    private onError: ChannelHostProxyErrorHandler =
        (hostProxy, error) => this.emit("error", this, error)

    private onClose: ChannelHostProxyEventHandler =
        (hostProxy) => {
            this.disposeAsync();
            this.emit("close", this);
        }

    private onListening: ChannelHostProxyEventHandler =
        (hostProxy) => this.emit("listening", this)
}

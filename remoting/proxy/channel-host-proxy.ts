//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import {
    IChannelHostProxy,
    IConnectionInfo,
    ChannelHostProxyConnectionHandler,
    ChannelHostProxyErrorHandler,
    ChannelHostProxyEventHandler,
    IChannelProxy
} from "..";

import * as utils from "../../utils";
import { IDictionary } from "../../common";

export abstract class ChannelHostProxy<THost> implements IChannelHostProxy {
    public abstract get connectionInfo(): IConnectionInfo;

    protected host: THost;

    protected get disposed(): boolean {
        return this.host === undefined;
    }

    private readonly handlers: IDictionary<(...args: Array<any>) => void>;

    public setHandler(type: "connection", handler: ChannelHostProxyConnectionHandler): this;
    public setHandler(type: "error", handler: ChannelHostProxyErrorHandler): this;
    public setHandler(type: "close", handler: ChannelHostProxyEventHandler): this;
    public setHandler(type: "listening", handler: ChannelHostProxyEventHandler): this;
    public setHandler(type: string, handler: (...args: Array<any>) => void): this {
        if (this.disposed) {
            throw new Error("Already disposed.");
        }

        if (!utils.isString(type)) {
            throw new Error("type must be a string.");
        }

        if (utils.isNullOrUndefined(handler)) {
            delete this.handlers[type];

        } else if (utils.isFunction(handler)) {
            this.handlers[type] = handler;

        } else {
            throw new Error("handler must be a function");
        }

        return this;
    }

    public async disposeAsync(): Promise<void> {
        if (this.disposed) {
            return;
        }

        this.host = undefined;

        for (const propName in this.handlers) {
            delete this.handlers[propName];
        }
    }

    constructor(host: THost) {
        if (utils.isNullOrUndefined(host)) {
            throw new Error("host must be provided.");
        }

        this.host = host;
        this.handlers = Object.create(null);
    }

    protected emit(type: "connection", channelProxy: IChannelProxy): void;
    protected emit(type: "error", error: any): void;
    protected emit(type: "close"): void;
    protected emit(type: "listening"): void;
    protected emit(type: string, ...args: Array<any>): void {
        if (this.disposed) {
            return;
        }

        const handler = this.handlers[type];

        if (!handler) {
            return;
        }

        handler(this, ...args);
    }
}

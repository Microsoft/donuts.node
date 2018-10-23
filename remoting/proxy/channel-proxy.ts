//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IChannelProxy, ChannelProxyDataHandler } from "..";

import * as utils from "../../utils";
import { Log } from "../../logging/log";

export abstract class ChannelProxy<TChannel> implements IChannelProxy {
    protected dataHandler: ChannelProxyDataHandler;

    private _channel: TChannel;

    public get channel(): TChannel {
        return this._channel;
    }

    public get disposed(): boolean {
        return this._channel === undefined;
    }

    constructor(channel: TChannel) {
        this._channel = channel;
    }

    public disposeAsync(): Promise<void> {
        this.dataHandler = undefined;
        this._channel = undefined;

        return Promise.resolve();
    }

    public abstract sendData(data: any): boolean;

    public setHandler(type: string, handler: ChannelProxyDataHandler): this {
        if (this.disposed
            && handler !== undefined
            && handler !== null) {
            throw new Error("Channel proxy already disposed.");
        }

        this.dataHandler = handler;
        return this;
    }

    protected triggerDataHandler(data: any): void {
        if (utils.isFunction(this.dataHandler)) {
            try {
                this.dataHandler(this, data);
            } catch (error) {
                Log.instance.writeExceptionAsync(error);
                throw error;
            }
        }
    }
}

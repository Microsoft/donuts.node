//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { Socket } from "net";

import * as utils from "../../utils";
import { ChannelProxy } from "./channel-proxy";
import { Log } from "../../logging/log";

export class SocketProxy extends ChannelProxy<Socket> {
    public static isValidChannel(channel: any): channel is Socket {
        return !utils.isNullOrUndefined(channel)
            && utils.isFunction(channel.write)
            && utils.isFunction(channel.on)
            && utils.isFunction(channel.removeListener);
    }

    public disposeAsync(): Promise<void> {
        if (!this.disposed) {
            this.channel.removeListener("data", this.onChannelData);
        }

        return super.disposeAsync();
    }

    public sendData(data: any): boolean {
        if (this.disposed) {
            throw new Error("Channel proxy already disposed.");
        }

        return this.channel.write(JSON.stringify(data));
    }

    constructor(channel: Socket) {
        super(channel);

        this.channel.on("data", this.onChannelData);
    }

    private onChannelData = (data: Buffer | string) => {
        try {
            if (Buffer.isBuffer(data)) {
                data = data.toString("utf8");
            }

            this.triggerDataHandler(JSON.parse(data));
            
        } catch (error) {
            Log.instance.writeExceptionAsync(error);
            throw error;
        }
    }
}

//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { ChildProcess } from "child_process";

import * as utils from "../../utils";
import { ChannelProxyBase } from "./channel-proxy-base";
import { Log } from "../../logging/log";

export class ProcessChannelProxy extends ChannelProxyBase<ChildProcess> {
    // Process and ChildProcess share the same functions but ChildProcess has more detailed type information.
    //
    // Process:
    // https://nodejs.org/docs/latest-v8.x/api/process.html#process_process_send_message_sendhandle_options_callback
    // https://nodejs.org/docs/latest-v8.x/api/process.html#process_event_message
    //
    // ChildProcess:
    // https://nodejs.org/docs/latest-v8.x/api/child_process.html#child_process_event_message
    // https://nodejs.org/docs/latest-v8.x/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback
    public static isValidChannel(channel: any): channel is ChildProcess {
        return !utils.isNullOrUndefined(channel)
            && utils.isFunction(channel.kill)
            && utils.isNumber(channel.pid)
            && utils.isFunction(channel.send)
            && utils.isFunction(channel.on)
            && utils.isFunction(channel.removeListener);
    }

    public disposeAsync(): Promise<void> {
        if (!this.disposed) {
            this.channel.removeListener("message", this.onMessage);
        }

        return super.disposeAsync();
    }

    public sendData(data: any): boolean {
        if (this.disposed) {
            throw new Error("Channel proxy already disposed.");
        }

        return this.channel.send(JSON.stringify(data));
    }

    constructor(channel: ChildProcess) {
        super(channel);

        this.channel.on("message", this.onMessage);
    }

    private onMessage = (message) => {
        if (utils.isString(message)) {
            try {
                this.triggerDataHandler(JSON.parse(message));
            } catch (error) {
                Log.instance.writeExceptionAsync(error);
                throw error;
            }
        }
    }
}

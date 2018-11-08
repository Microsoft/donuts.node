//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const utils = require("donuts.node/utils");
const { ChannelProxy } = require("./channel-proxy");
const { Log } = require("donuts.node/logging/log");

/** @typedef {import("child_process").ChildProcess} ChildProcess */
/** 
 * @template TChannel
 * @typedef {import("./channel-proxy").ChannelProxy<TChannel>} ChannelProxy
 */

/**
 * @class
 * @extends {ChannelProxy<ChildProcess>}
 */
class ProcessProxy extends ChannelProxy {
    // Process and ChildProcess share the same functions but ChildProcess has more detailed type information.
    //
    // Process:
    // https://nodejs.org/docs/latest-v8.x/api/process.html#process_process_send_message_sendhandle_options_callback
    // https://nodejs.org/docs/latest-v8.x/api/process.html#process_event_message
    //
    // ChildProcess:
    // https://nodejs.org/docs/latest-v8.x/api/child_process.html#child_process_event_message
    // https://nodejs.org/docs/latest-v8.x/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback

    /**
     * @public
     * @param {*} channel 
     * @returns {channel is ChildProcess}
     */
    static isValidChannel(channel) {
        return !utils.isNullOrUndefined(channel)
            && utils.isFunction(channel.kill)
            && utils.isNumber(channel.pid)
            && utils.isFunction(channel.send)
            && utils.isFunction(channel.on)
            && utils.isFunction(channel.removeListener);
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    async disposeAsync() {
        if (!this.disposed) {
            this.channel.removeListener("message", this.onMessage);
        }

        await super.disposeAsync();
    }

    /**
     * @public
     * @param {*} data 
     * @returns {Promise<void>}
     */
    sendDataAsync(data) {
        if (this.disposed) {
            throw new Error("Channel proxy already disposed.");
        }

        const sendData = () => new Promise((resolve, reject) => {
            this.channel.send(
                JSON.stringify(data), 
                (error) => error ? reject(error) : resolve());
        });

        return this.outgoingDataQueue.then(sendData, sendData)
    }

    /**
     * 
     * @param {ChildProcess} channel 
     */
    constructor(channel) {
        super(channel);

        /**
         * @private
         * @type {Promise<void>}
         */
        this.outgoingDataQueue = Promise.resolve();

        /**
         * @private
         * @param {*} message
         */
        this.onMessage = (message) => {
            if (utils.isString(message)) {
                try {
                    this.triggerHandler("data", JSON.parse(message));

                } catch (error) {
                    Log.instance.writeExceptionAsync(error);
                    throw error;
                }
            }
        }

        this.onDisconnect = () => {
            this.triggerHandler("close");
        };

        this.channel.on("disconnect", this.onDisconnect);
        this.channel.on("close", this.onDisconnect);
        this.channel.on("message", this.onMessage);
    }
}
exports.ProcessProxy = ProcessProxy;

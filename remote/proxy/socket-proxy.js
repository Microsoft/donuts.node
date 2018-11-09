//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { Socket } = require("net");
const utils = require("donuts.node/utils");
const { ChannelProxy } = require("./channel-proxy");
const { Log } = require("donuts.node/logging/log");

/** @typedef {import("net").Socket} Socket */

/** 
 * @template TChannel
 * @typedef {import("./channel-proxy").ChannelProxy<TChannel>} ChannelProxy
 */

/**
 * @typedef OutgoingQueueItem
 * @property {*} data
 * @property {(result?:any)=>void} resolve
 * @property {(reason?:any)=>void} reject
 */

/**
 * @class
 * @extends {ChannelProxy<Socket>}
 */
class SocketProxy extends ChannelProxy {
    /**
     * @public
     * @param {*} channel 
     * @returns {channel is Socket}
     */
    static isValidChannel(channel) {
        return !utils.isNullOrUndefined(channel)
            && utils.isFunction(channel.write)
            && utils.isFunction(channel.on)
            && utils.isFunction(channel.removeListener);
    }

    /**
     * 
     * @param {Socket} channel 
     */
    constructor(channel) {
        super(channel);

        /** @type {string} */
        this.incomingBuffer = "";

        /**
         * @private
         * @param {Buffer | string} data
         * @returns {void}
         */
        this.onChannelData = (data) => {
            try {
                if (Buffer.isBuffer(data)) {
                    data = data.toString("utf8");
                }

                this.incomingBuffer = this.incomingBuffer + data;

                const segmentEnd = this.incomingBuffer.indexOf(";");

                if (segmentEnd < 0) {
                    return;
                }

                const segments = this.incomingBuffer.split(";");

                for (let dataEntryIndex = 0; dataEntryIndex < segments.length - 1; dataEntryIndex++) {
                    const dataEntry = segments[dataEntryIndex];

                    if (!dataEntry) {
                        continue;
                    }

                    this.triggerHandler("data", JSON.parse(Buffer.from(dataEntry, "base64").toString("utf8")));
                }

                this.incomingBuffer = segments.pop() || "";
            } catch (error) {
                Log.instance.writeExceptionAsync(error);
                throw error;
            }
        };

        this.onChannelClose = () => {
            this.triggerHandler("close");
        };

        /**
         * @param {Error} err
         * @returns {void}
         */
        this.onChannelError = (err) => {
            this.triggerHandler("error", err);
        };

        this.channel.on("data", this.onChannelData);
        this.channel.on("close", this.onChannelClose);
        this.channel.on("error", this.onChannelError);
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    async disposeAsync() {
        if (!this.disposed) {
            this.channel.removeListener("data", this.onChannelData);
            this.channel.destroy();
        }

        await super.disposeAsync();
    }

    /**
     * @public
     * @param {*} data 
     * @returns {void}
     */
    sendData(data) {
        if (this.disposed) {
            throw new Error("Channel proxy already disposed.");
        }

        this.channel.write(Buffer.from(JSON.stringify(data)).toString("base64") + ";");
    }
}
exports.SocketProxy = SocketProxy;

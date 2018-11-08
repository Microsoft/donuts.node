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

                if (!data) {
                    return;
                }

                for (const dataEntry of data.split(";")) {
                    if (!dataEntry) {
                        continue;
                    }

                    this.triggerHandler("data", JSON.parse(Buffer.from(dataEntry, "base64").toString("utf8")));
                }

            } catch (error) {
                Log.instance.writeExceptionAsync(error);
                throw error;
            }
        };

        this.onChannelClose = () => {
            this.triggerHandler("close");
        };

        this.channel.on("data", this.onChannelData);
        this.channel.on("close", this.onChannelClose);
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
     * @returns {Promise<void>}
     */
    sendDataAsync(data) {
        if (this.disposed) {
            throw new Error("Channel proxy already disposed.");
        }

        /**
         * @return {Promise<void>}
         */
        return new Promise((resolve, reject) => {
            this.channel.write(Buffer.from(JSON.stringify(data)).toString("base64"));
            this.channel.write(";", () => resolve());
        });
    }
}
exports.SocketProxy = SocketProxy;

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

        const sendData = () => new Promise((resolve, reject) => {
            this.channel.write(JSON.stringify(data), () => resolve());
        });

        return this.outgoingDataQueue.then(sendData, sendData)
    }

    /**
     * 
     * @param {Socket} channel 
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
         * @param {Buffer | string} data
         */
        this.onChannelData = (data) => {
            try {
                if (Buffer.isBuffer(data)) {
                    data = data.toString("utf8");
                }

                this.triggerHandler("data", JSON.parse(data));

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
}
exports.SocketProxy = SocketProxy;

//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const utils = require("donuts.node/utils");
const { Log } = require("donuts.node/logging/log");

/**
 * @template TChannel
 * @class 
 * @abstract
 * @implements {Donuts.Remote.IChannelProxy}
 */
class ChannelProxy {
    /**
     * @public
     * @returns {TChannel}
     */
    get channel() {
        return this._channel;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get disposed() {
        return this._channel === undefined;
    }

    /**
     * 
     * @param {TChannel} channel 
     */
    constructor(channel) {
        /** 
         * @private
         * @type {Object.<string, (channel: Donuts.Remote.IChannelProxy, ...args: Array.<*>)=>void>} 
         * */
        this.handlers = Object.create(null)

        /**
         * @private 
         * @type {TChannel} 
         * */
        this._channel = channel;
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    async disposeAsync() {
        this.dataHandler = undefined;
        this._channel = undefined;
    }

    /**
     * @public
     * @abstract
     * @param {*} data 
     * @return {void}
     */
    sendData(data) {
    }

    /**
     * 
     * @public
     * @param {string} type 
     * @param {Donuts.Remote.ChannelProxyHandler} handler 
     * @returns {this}
     */
    setHandler(type, handler) {
        if (this.disposed
            && handler !== undefined
            && handler !== null) {
            throw new Error("Channel proxy already disposed.");
        }

        if (!utils.isString(type)) {
            throw new Error("type must be a string.");
        }

        this.handlers[type] = handler;

        return this;
    }

    /**
     * @protected
     * @param {string} type
     * @param {...*} args
     * @return {void}
     */
    triggerHandler(type, ...args) {
        const handler = this.handlers[type];

        if (!utils.isFunction(handler)) {
            return;
        }

        try {
            handler(this, ...args);

        } catch (error) {
            Log.instance.writeExceptionAsync(error);
            throw error;
        }
    }
}
exports.ChannelProxy = ChannelProxy;

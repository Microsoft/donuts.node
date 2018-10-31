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
        /** @type {Donuts.Remote.ChannelProxyDataHandler} */
        this.dataHandler = undefined;

        /** @type {TChannel} */
        this._channel = channel;
    }

    /**
     * @public
     * @returns {void}
     */
    dispose() {
        this.dataHandler = undefined;
        this._channel = undefined;
    }

    /**
     * @public
     * @abstract
     * @param {*} data 
     * @return {boolean}
     */
    sendData(data) {
        return false;
    }

    /**
     * 
     * @public
     * @param {string} type 
     * @param {Donuts.Remote.ChannelProxyDataHandler} handler 
     * @returns {this}
     */
    setHandler(type, handler) {
        if (this.disposed
            && handler !== undefined
            && handler !== null) {
            throw new Error("Channel proxy already disposed.");
        }

        this.dataHandler = handler;
        return this;
    }

    /**
     * @protected
     * @param {*} data 
     * @return {void}
     */
    triggerDataHandler(data) {
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
exports.ChannelProxy = ChannelProxy;

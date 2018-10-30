//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const utils = require("donuts.node/utils");

/**
 * @template THost
 * @class
 * @implements {Donuts.Remote.IChannelHostProxy}
 */
class ChannelHostProxy {
    /**
     * @public
     * @abstract
     * @returns {Donuts.Remote.IConnectionInfo}
     */
    get connectionInfo() {
        return undefined;
    }

    /**
     * @protected
     * @return {boolean}
     */
    get disposed() {
        return this.host === undefined;
    }

    /**
     * @public
     * @param {string} type 
     * @param {(...args: Array.<*>)=>void} handler 
     * @returns {this}
     */
    setHandler(type, handler) {
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

    /**
     * @public
     * @returns {void}
     */
    dispose() {
        if (this.disposed) {
            return;
        }

        this.host = undefined;

        for (const propName in this.handlers) {
            delete this.handlers[propName];
        }
    }

    /**
     *
     * @param {THost} host 
     */
    constructor(host) {
        if (utils.isNullOrUndefined(host)) {
            throw new Error("host must be provided.");
        }

        /**
         * @protected
         * @type {THost}
         */
        this.host = host;

        /**
         * @private
         * @readonly
         * @type {Donuts.IDictionary.<(...args: Array<*>)=>void>}
         */
        this.handlers = Object.create(null);
    }

    /**
     * @protected
     * @param {string} type 
     * @param  {...*} args 
     * @returns {void}
     */
    emit(type, ...args) {
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
exports.ChannelHostProxy = ChannelHostProxy;

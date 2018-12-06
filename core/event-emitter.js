//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const utils = require("./utils");

/**
 * @implements {Donuts.IEventEmitter}
 */
class EventEmitter {
    /**
     * @public
     */
    constructor() {
        /**
         * @private
         * @readonly
         * @type {Donuts.IStringKeyDictionary<Array<(...args: Array<any>)=>void>>}
         */
        this.handlersDict = Object.create(null);

        /**
         * @private
         * @readonly
         * @type {symbol}
         */
        this.symbol_once = Symbol("once");
    }

    /**
     * 
     * @public
     * @param {string} event 
     * @param {(...args: Array<any>) => void} handler 
     * @returns {this}
     */
    preOn(event, handler) {
        if (!utils.isString(event)) {
            throw new Error("event must be a string.");
        }

        if (!utils.isFunction(handler)) {
            throw new Error("handler must be a function.");
        }

        const handlers = this.handlersDict[event] = this.handlersDict[event] || [];

        handlers.splice(0, 0, handler);

        return this;
    }

    /**
     * 
     * @public
     * @param {string} event 
     * @param {(...args: Array<any>) => void} handler 
     * @returns {this}
     */
    preOnce(event, handler) {
        if (!utils.isString(event)) {
            throw new Error("event must be a string.");
        }

        if (!utils.isFunction(handler)) {
            throw new Error("handler must be a function.");
        }

        // @ts-ignore
        handler[this.symbol_once] = true;

        return this.preOn(event, handler);
    }

    /**
     * 
     * @public
     * @param {string} event 
     * @param {(...args: Array<any>) => void} handler 
     * @returns {this}
     */
    on(event, handler) {
        if (!utils.isString(event)) {
            throw new Error("event must be a string.");
        }

        if (!utils.isFunction(handler)) {
            throw new Error("handler must be a function.");
        }

        const handlers = this.handlersDict[event] = this.handlersDict[event] || [];

        handlers.push(handler);

        return this;
    }


    /**
     * @public
     * @param {string} event 
     * @param {(...args: Array<any>) => void} handler 
     * @returns {this}
     */
    once(event, handler) {
        if (!utils.isString(event)) {
            throw new Error("event must be a string.");
        }

        if (!utils.isFunction(handler)) {
            throw new Error("handler must be a function.");
        }

        // @ts-ignore
        handler[this.symbol_once] = true;

        return this.on(event, handler);
    }

    /**
     * @public
     * @param {string} event 
     * @param {(...args: Array<any>) => void} handler 
     * @returns {this}
     */
    off(event, handler) {
        if (!utils.isString(event)) {
            throw new Error("event must be a string.");
        }

        if (!utils.isFunction(handler)) {
            throw new Error("handler must be a function.");
        }

        const handlers = this.handlersDict[event];

        if (handlers) {
            handlers.splice(handlers.indexOf(handler), 1);
        }

        return this;
    }

    /**
     * @public
     * @param {string} event 
     * @param  {...any} args 
     * @returns {any}
     */
    emit(event, ...args) {
        if (!utils.isString(event)) {
            throw new Error("event must be a string.");
        }

        const handlers = this.handlersDict[event];

        if (handlers) {
            for (let handlerIndex = handlers.length - 1; handlerIndex >= 0; handlerIndex--) {
                const handler = handlers[handlerIndex];

                try {
                    const result = handler(...args);

                    if (result !== undefined) {
                        return result;
                    }

                } finally {
                    // @ts-ignore
                    if (handler[this.symbol_once]) {
                        // @ts-ignore
                        delete handler[this.symbol_once];

                        handlers.splice(handlerIndex, 1);
                    }
                }
            }
        }

        return undefined;
    }
}
exports.EventEmitter = EventEmitter;
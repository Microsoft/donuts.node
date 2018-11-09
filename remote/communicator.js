//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const uuidv4 = require("uuid/v4");
const utils = require("donuts.node/utils");
const { isChannelProxy } = require(".");
const { EventEmitter } = require("events");

/**
 * @typedef IPromiseResolver 
 * @property {(value?: *)=>void} resolve
 * @property {(reason?: *)=>void} reject
 */

/**
 * @typedef IRoute
 * @property {Donuts.Remote.IRoutePattern} pattern
 * @property {Donuts.Remote.AsyncRequestHandler} asyncHandler
 */

exports.UuidNamespace = "65ef6f94-e6c9-4c95-8360-6d29de87b1dd";

/**
 * @this {Error}
 * @returns {string}
 */
function ErrorToJSON() {
    const error = Object.create(null);

    error.message = `Error: ${this.message}`;
    error.stack = this.stack;

    return error;
}

/**
 * @class
 * @implements {Donuts.Remote.ICommunicator}
 */
class Communicator extends EventEmitter {
    /**
     * 
     * @param {Donuts.Remote.IChannelProxy} channelProxy 
     * @param {Donuts.Remote.ICommunicatorConstructorOptions} [options]
     */
    constructor(channelProxy, options) {

        if (!isChannelProxy(channelProxy)) {
            throw new Error("channelProxy must be a IChannelProxy object.");
        }

        super();

        /** 
         * @private
         * @type {Array.<IRoute>}
         */
        this.routes = [];

        /** 
         * @private
         * @type {Object.<string, IPromiseResolver>} 
         */
        this.ongoingPromiseDict = Object.create(null);

        /**
         * @public
         * @readonly 
         * @type {string}
         */
        this.id = uuidv4();

        if (options) {
            if (utils.isString(options.id)
                && !utils.string.isEmptyOrWhitespace(options.id)) {
                this.id = options.id;
            }

            if (utils.isNumber(options.timeout)) {
                /**
                 * @readonly
                 * @type {number}
                 */
                this.timeout = options.timeout;
            }
        }

        /** 
         * @private
         * @type {Donuts.Remote.IChannelProxy}
         */
        this.channelProxy = channelProxy;

        /**
         * @private
         * @param {Donuts.Remote.IChannelProxy} channel
         * @param {Donuts.Remote.IMessage} msg
         * @returns {Promise<void>}
         */
        this.onMessageAsync = async (channel, msg) => {
            const promise = this.ongoingPromiseDict[msg.id];

            if (promise) {
                delete this.ongoingPromiseDict[msg.id];
                msg.succeeded ? promise.resolve(msg.body) : promise.reject(msg.body);

            } else if (utils.isNullOrUndefined(msg.succeeded)) {
                /** @type {Donuts.Remote.IRoutePathInfo} */
                let pathInfo;

                /** @type {Donuts.Remote.AsyncRequestHandler} */
                let asyncHandler;

                // Find the corresponding route and
                // generate the pathInfo.
                for (const route of this.routes) {
                    asyncHandler = route.asyncHandler;
                    pathInfo = route.pattern.match(msg.path);

                    if (pathInfo) {
                        break;
                    }
                }

                if (!pathInfo) {
                    return;
                }

                /** @type {*} */
                let response;

                /** @type {boolean} */
                let succeeded;

                try {
                    response = await asyncHandler(this, pathInfo, msg.body);
                    succeeded = true;

                } catch (exception) {
                    response = exception;
                    succeeded = false;

                    // @ts-ignore
                    if (response instanceof Error && !response["toJSON"]) {
                        // @ts-ignore
                        response.toJSON = ErrorToJSON;
                    }
                }

                this.channelProxy.sendData({
                    id: msg.id,
                    path: msg.path,
                    succeeded: succeeded,
                    body: response
                });
            }
        };

        /**
         * @private
         * @param {Donuts.Remote.IChannelProxy} proxy
         * @return {void}
         */
        this.onClose = (proxy) => {
            this.emit("close", this);
        };

        /**
         * @private
         * @param {Donuts.Remote.IChannelProxy} proxy
         * @param {Error} err
         * @return {void}
         */
        this.onError = (proxy, err) => {
            this.emit("error", this, err);
        };

        this.channelProxy.setHandler("data", this.onMessageAsync);
        this.channelProxy.setHandler("close", this.onClose);
        this.channelProxy.setHandler("error", this.onError);
    }

    /**
     * @public
     * @param {Donuts.Remote.IRoutePattern} pattern 
     * @param {Donuts.Remote.AsyncRequestHandler} asyncHandler 
     * @returns {this}
     */
    map(pattern, asyncHandler) {
        this.validateDisposal();

        if (!pattern) {
            throw new Error("pattern must be provided.");
        }

        if (!utils.isFunction(asyncHandler)) {
            throw new Error("asyncHandler must be a function.");
        }

        /** @type {IRoute} */
        const route = {
            pattern: pattern,
            asyncHandler: asyncHandler
        };

        this.routes.push(route);
        return this;
    }

    /**
     * @public
     * @param {Donuts.Remote.IRoutePattern} pattern
     * @returns {this} 
     */
    unmap(pattern) {
        this.validateDisposal();

        if (utils.isNullOrUndefined(pattern)) {
            throw new Error("pattern must be supplied.");
        }

        const routeIndex = this.routes.findIndex((route) => route.pattern.equals(pattern));

        if (routeIndex < 0) {
            return undefined;
        }

        this.routes.splice(routeIndex, 1);

        return this;
    }

    /**
     * @public
     * @template TRequest, TResponse* 
     * @param {string} path 
     * @param {TRequest} content 
     * @returns {Promise<TResponse>}
     */
    sendAsync(path, content) {
        this.validateDisposal();

        if (utils.string.isEmptyOrWhitespace(path)) {
            throw new Error("path must be a string and not empty/whitespaces.");
        }

        return new Promise((resolve, reject) => {
            /** @type {Donuts.Remote.IMessage} */
            const msg = {
                id: uuidv4(),
                path: path,
                body: content
            };

            this.channelProxy.sendData(msg);

            if (this.timeout) {
                setTimeout(
                    (msgId) => {
                        const record = this.ongoingPromiseDict[msg.id];

                        if (!record) {
                            return;
                        }

                        record.reject(new Error(`Communicator-${this.id}: Message, ${msgId}, timed out (${this.timeout}).`));
                    },
                    this.timeout,
                    msg.id);
            }

            this.ongoingPromiseDict[msg.id] = {
                resolve: (result) => resolve(result),
                reject: (error) => reject(error)
            };
        });
    }

    /**
     * @public
     * @returns {boolean}
     */
    get disposed() {
        return this.channelProxy === undefined;
    }

    /**
     * @public
     * @return {Promise<void>}
     */
    async disposeAsync() {
        if (this.disposed) {
            return;
        }

        await this.channelProxy.disposeAsync();
        Object.values(this.ongoingPromiseDict).forEach((resolver) => resolver.reject(new Error(`Communicator (${this.id}) is disposed.`)));

        this.channelProxy.setHandler("data", undefined);
        this.channelProxy = undefined;
        this.routes = undefined;
        this.ongoingPromiseDict = undefined;
        this.removeAllListeners();
    }

    /**
     * @private
     * @returns {void}
     */
    validateDisposal() {
        if (this.disposed) {
            throw new Error(`Communicator (${this.id}) already disposed.`);
        }
    }
}
exports.Communicator = Communicator;
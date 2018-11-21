//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const utils = require("donuts.node/utils");
const random = require("donuts.node/random");
const { isChannelProxy } = require(".");
const { EventEmitter } = require("events");
const Log = require("donuts.node/logging").getLog();

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

/** @enum {string} */
const Action = {
    Send: "SEND",
    Sent: "SENT",
    Failed: "FAILED",
    Receive: "RECEIVE",
    Respond: "RESPOND"
};

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
        this.id = random.generateUid(6);

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

            /** @type {number} */
            const receivedTimestamp = Date.now();

            Log.writeInfoAsync("{} REMOTE {,7} {} ~{,4:F0}ms <= {}:{}", this.id, Action.Receive, msg.id, receivedTimestamp - msg.timestamp, msg.sender, msg.path);

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

                /** @type {Donuts.Remote.IMessage} */
                const responseMsg = {
                    id: msg.id,
                    sender: this.id,
                    timestamp: Date.now(),
                    path: msg.path,
                    succeeded: succeeded,
                    body: response
                };

                Log.writeInfoAsync("{} REMOTE {,7} {} ~{,4:F0}ms => {}:{}", this.id, Action.Respond, responseMsg.id, responseMsg.timestamp - receivedTimestamp, msg.sender, msg.path);
                this.channelProxy.sendData(responseMsg);
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
                id: random.generateUid(8),
                sender: this.id,
                timestamp: Date.now(),
                path: path,
                body: content
            };

            Log.writeInfoAsync("{} REMOTE {,7} {} => {}", msg.sender, Action.Send, msg.id, msg.path);
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
                resolve: (result) => {
                    Log.writeInfoAsync("{} REMOTE {,7} {} ~{,4:F0}ms => {}", msg.sender, Action.Sent, msg.id, Date.now() - msg.timestamp, msg.path);
                    resolve(result);
                },
                reject: (error) => {
                    Log.writeErrorAsync("{} REMOTE {,7} {} ~{,4:F0}ms: {}", msg.sender, Action.Failed, msg.id, Date.now() - msg.timestamp, error);
                    reject(error);
                }
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
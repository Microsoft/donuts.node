//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { EventEmitter } = require("events");
const utils = require("donuts.node/utils");
const { isChannelHostProxy, isRoutePattern } = require(".");
const { Communicator } = require("./communicator");

/**
 * @typedef IRoute
 * @property {Donuts.Remote.IRoutePattern} pattern
 * @property {Donuts.Remote.AsyncRequestHandler} asyncHandler
 */

/**
 * @class
 * @implements {Donuts.Remote.ICommunicationHost}
 */
class CommunicationHost extends EventEmitter {
    /**
     * @returns {boolean}
     */
    get disposed() {
        return this.host === undefined;
    }

    /**
     * 
     * @param {Donuts.Remote.IChannelHostProxy} host 
     * @param {Donuts.Remote.ICommunicatorConstructorOptions} [options]
     */
    constructor(host, options) {
        super();

        if (!isChannelHostProxy(host)) {
            throw new Error("host must be a IChannelHostProxy object.");
        }

        /** @type {Array.<IRoute>} */
        this.routes = [];

        /**
         * @readonly
         * @type {Object.<string, Donuts.Remote.ICommunicator>}
         */
        this.communicators = Object.create(null);

        /** @type {Donuts.Remote.ICommunicatorConstructorOptions} */
        this.communicatorOptions = options;

        /** @type {Donuts.Remote.IChannelHostProxy} */
        this.host = host;

        /**
         * @readonly
         * @type {Donuts.Remote.IConnectionInfo}
         */
        this.connectionInfo = Object.create(null);

        Object.assign(this.connectionInfo, this.host.connectionInfo);
        this.connectionInfo.communicatorOptions = this.communicatorOptions || this.connectionInfo.communicatorOptions;

        this.host.setHandler("close", this.onClose);
        this.host.setHandler("connection", this.onConnection);
        this.host.setHandler("error", this.onError);
        this.host.setHandler("listening", this.onListening);
    }

    /**
     * 
     * @param {Donuts.Remote.IRoutePattern} pattern 
     * @param {Donuts.Remote.AsyncRequestHandler} asyncHandler 
     * @returns {this}
     */
    map(pattern, asyncHandler) {
        if (this.disposed) {
            throw new Error("Already disposed.");
        }

        if (!isRoutePattern(pattern)) {
            throw new Error("pattern must be a IRoutePattern object.");
        }

        if (!utils.isFunction(asyncHandler)) {
            throw new Error("asyncHandler must be a function");
        }

        /** @type {IRoute} */
        const route = Object.create(null);

        route.pattern = pattern;
        route.asyncHandler = asyncHandler;

        this.routes.push(route);

        for (const communicator of Object.values(this.communicators)) {
            communicator.map(pattern, asyncHandler);
        }

        return this;
    }

    /**
     * 
     * @param {Donuts.Remote.IRoutePattern} pattern 
     * @return {this}
     */
    unmap(pattern) {
        if (this.disposed) {
            throw new Error("Already disposed.");
        }

        if (!isRoutePattern(pattern)) {
            throw new Error("pattern must be a IRoutePattern object.");
        }

        for (let routeIndex = 0; routeIndex < this.routes.length; routeIndex++) {
            const route = this.routes[routeIndex];

            if (route.pattern.equals(pattern)) {
                this.routes.splice(routeIndex, 1);
                break;
            }
        }

        for (const communicator of Object.values(this.communicators)) {
            communicator.unmap(pattern);
        }

        return this;
    }

    /**
     * @return {void}
     */
    dispose() {
        if (this.disposed) {
            return;
        }

        this.host.dispose();

        this.host.setHandler("close", undefined);
        this.host.setHandler("connection", undefined);
        this.host.setHandler("error", undefined);
        this.host.setHandler("listening", undefined);

        this.host = undefined;
        this.communicatorOptions = undefined;
        this.routes = undefined;

        for (const propName in this.communicators) {
            this.communicators[propName].dispose();

            delete this.communicators[propName];
        }
    }

    /**
     * @type {Donuts.Remote.ChannelHostProxyConnectionHandler}
     */
    onConnection = (hostProxy, channelProxy) => {
        const communicator = new Communicator(channelProxy, this.communicatorOptions);

        for (const route of this.routes) {
            communicator.map(route.pattern, route.asyncHandler);
        }

        this.communicators[communicator.id] = communicator;
        this.emit("connection", this, communicator);
    }

    /**
     * @type {Donuts.Remote.ChannelHostProxyErrorHandler}
     */
    onError = (hostProxy, error) => {
        this.emit("error", this, error);
    }
    /**
     * @type {Donuts.Remote.ChannelHostProxyEventHandler}
     */
    onClose = (hostProxy) => {
        this.dispose();
        this.emit("close", this);
    };

    /** 
     * @type {Donuts.Remote.ChannelHostProxyEventHandler}
     */
    onListening = (hostProxy) => {
        this.emit("listening", this);
    }
}
exports.CommunicationHost = CommunicationHost;
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const uuidv4 = require("uuid/v4");
const utils = require("donuts.node/utils");
const { DataInfoManager } = require("./data-info-manager");
const StringPattern = require("./pattern/string").String;

/**
 * 
 * @param {*} value 
 * @returns {value is Donuts.Remote.IProxyMessage}
 */
function isProxyMessage(value) {
    return !utils.isNullOrUndefined(value)
        && utils.isString(value.action);
}

/**
 * @class
 * @implements {Donuts.Remote.IObjectRemotingProxy}
 */
class ObjectRemotingProxy {

    /**
     * @public
     * @returns {string}
     */
    get id() {
        return this._id;
    }

    /**
     * @public
     * @returns {Donuts.Remote.ICommunicator}
     */
    get communicator() {
        return this._communicator;
    }

    /**
     * @public
     * @returns {Donuts.Remote.IRoutePattern}
     */
    get routePattern() {
        return this._routePattern;
    }

    /**
     * @public
     * @param {Donuts.Remote.ObjectResolver} resolver 
     * @returns {void}
     */
    set resolver(resolver) {
        this.validateDisposal();

        if (resolver && !utils.isFunction(resolver)) {
            throw new Error("resolver must be a function.");
        }

        this._resolver = resolver;
    }

    /**
     * @public
     * @returns {Donuts.Remote.ObjectResolver}
     */
    get resolver() {
        this.validateDisposal();
        return this._resolver;
    }

    /**
     * @public
     * @param {Donuts.Remote.ICommunicator} communicator 
     * @param {string} [path]
     * @param {boolean} [ownCommunicator=false]
     * @param {string} [proxyId]
     */
    constructor(communicator, path, ownCommunicator, proxyId) {
        if (utils.isNullOrUndefined(communicator)) {
            throw new Error("communicator must be provided.");
        }

        if (!utils.isNullOrUndefined(path) && !utils.isString(path)) {
            throw new Error("path must be a string.");
        }

        /** @type {Donuts.Remote.ObjectResolver} */
        this._resolver = undefined;

        /**
         * @private
         * @readonly
         * @type {string}
         */
        this._id = proxyId || uuidv4();

        /**
         * @private
         * @type {Donuts.Remote.ICommunicator}
         */
        this._communicator = communicator;

        /**
         * @private
         * @readonly
         * @type {boolean}
         */
        this.ownCommunicator = ownCommunicator === true;

        /**
         * @private
         * @readonly
         * @type {Donuts.Remote.IRoutePattern}
         */
        this._routePattern = new StringPattern(path || "/object-remoting-proxy");

        /**
         * @private
         * @readonly
         * @type {Object.<Donuts.Remote.ProxyAction, Donuts.Remote.AsyncRequestHandler>}
         */
        this.messageHandlers = Object.create(null);

        /**
         * @private
         * @readonly
         * @type {import("./data-info-manager").DataInfoManager}
         */
        this.dataInfoManager = new DataInfoManager(this);

        /**
         * @private
         * @param {Donuts.Remote.ICommunicator} communicator
         * @param {Donuts.Remote.IRoutePathInfo} pathInfo
         * @param {Donuts.Remote.IProxyMessage} proxyMsg
         * @returns {Promise<*>}
         */
        this.onMessage = (communicator, pathInfo, proxyMsg) => {
            if (!isProxyMessage(proxyMsg)) {
                // Log Error.
                return Promise.resolve();
            }

            /** @type {Donuts.Remote.AsyncRequestHandler} */
            const asyncRequestHandler = this.messageHandlers[proxyMsg.action];

            if (!asyncRequestHandler) {
                // Log Error.
                return Promise.resolve();
            }

            return asyncRequestHandler(communicator, pathInfo, proxyMsg);
        }

        /**
         * @private
         * @param {Donuts.Remote.ICommunicator} communicator
         * @param {Donuts.Remote.IRoutePathInfo} pathInfo
         * @param {Donuts.Remote.IResourceGetPropertyMessage} msg
         * @returns {Promise<*>}
         */
        this.onGetPropertyAsync = async (communicator, pathInfo, msg) => {
            const target = this.dataInfoManager.get(msg.refId);

            if (target === undefined) {
                throw new Error(`Target (${msg.refId}) doesn't exist.`);
            }

            return this.dataInfoManager.toDataInfo(target[msg.property]);
        }

        /**
         * @private
         * @param {Donuts.Remote.ICommunicator} communicator
         * @param {Donuts.Remote.IRoutePathInfo} pathInfo
         * @param {Donuts.Remote.IResourceSetPropertyMessage} msg
         * @returns {Promise<*>}
         */
        this.onSetPropertyAsync = async (communicator, pathInfo, msg) => {
            const target = this.dataInfoManager.get(msg.refId);

            if (target === undefined) {
                throw new Error(`Target (${msg.refId}) doesn't exist.`);
            }

            target[msg.property] = this.dataInfoManager.realizeDataInfo(msg.value);

            return true;
        }

        /**
         * @private
         * @param {Donuts.Remote.ICommunicator} communicator
         * @param {Donuts.Remote.IRoutePathInfo} pathInfo
         * @param {Donuts.Remote.IResourceApplyMessage} msg
         * @returns {Promise<*>}
         */
        this.onApplyAsync = async (communicator, pathInfo, msg) => {
            /** @type {Function} */
            const target = this.dataInfoManager.get(msg.refId);

            if (target === undefined) {
                throw new Error(`Target (${msg.refId}) doesn't exist.`);
            }

            if (typeof target !== "function") {
                throw new Error(`Target (${msg.refId}) is not a function which cannot be applied.`);
            }

            /** @type {Array.<*>} */
            const args = [];

            for (const argDataInfo of msg.args) {
                args.push(this.dataInfoManager.realizeDataInfo(argDataInfo));
            }

            /** @type {*} */
            const result = target.apply(this.dataInfoManager.realizeDataInfo(msg.thisArg), args);

            return this.dataInfoManager.toDataInfo(result);
        }

        /**
         * @private
         * @param {Donuts.Remote.ICommunicator} communicator
         * @param {Donuts.Remote.IRoutePathInfo} pathInfo
         * @param {Donuts.Remote.IResourceRequestMessage} msg
         * @returns {Promise<*>}
         */
        this.onRequestResourceAsync = async (communicator, pathInfo, msg) => {
            /** @type {Array.<*>} */
            const extraArgs = [];

            for (const extraArgDataInfo of msg.extraArgs) {
                extraArgs.push(this.dataInfoManager.realizeDataInfo(extraArgDataInfo));
            }

            const target = await this.resolveAsync(msg.identifier, ...extraArgs);

            return this.dataInfoManager.toDataInfo(target);
        }

        /**
         * @private
         * @param {Donuts.Remote.ICommunicator} communicator
         * @param {Donuts.Remote.IRoutePathInfo} pathInfo
         * @param {Donuts.Remote.IResourceReleaseMessage} msg
         * @returns {Promise<*>}
         */
        this.onReleaseResourceAsync = async (communicator, pathInfo, msg) => {
            await this.dataInfoManager.delDataInfo(msg.refId);
        }

        this.initializeMessageHandlers();
        this.communicator.map(this.routePattern, this.onMessage);
    }

    /**
     * @public
     * @template T
     * @param {string} identifier 
     * @param  {...*} extraArgs 
     * @returns {Promise<T>}
     */
    async requestAsync(identifier, ...extraArgs) {
        this.validateDisposal();

        if (!utils.isString(identifier)) {
            throw new Error("identifier must be a string.");
        }

        /** @type {Array.<Donuts.Remote.IDataInfo>} */
        const extraArgsDataInfos = extraArgs.map((arg) => this.dataInfoManager.toDataInfo(arg));

        /** @type {Donuts.Remote.IResourceRequestMessage} */
        const requestResourceMsg = {
            action: "Resource.Request",
            extraArgs: extraArgsDataInfos,
            identifier: identifier
        };

        /** @type {Donuts.Remote.IDataInfo} */
        const targetDataInfo = await this.communicator.sendAsync(this.routePattern.getRaw(), requestResourceMsg);

        return Promise.resolve(this.dataInfoManager.realizeDataInfo(targetDataInfo));
    }

    /**
     * @public
     * @param {string} refId 
     * @returns {Promise<void>}
     */
    async releaseAsync(refId) {
        this.validateDisposal();

        if (!utils.isString(refId)) {
            throw new Error("refId must be a string.");
        }

        /** @type {Donuts.Remote.IResourceReleaseMessage} */
        const releaseResourceMsg = {
            action: "Resource.Release",
            refId: refId
        };

        await this.communicator.sendAsync(this.routePattern.getRaw(), releaseResourceMsg);
    }

    /**
     * @public
     * @template T
     * @param {string} refId
     * @param {*} thisArg
     * @param {Array.<*>} args
     * @returns {Promise<T>}
     */
    async applyAsync(refId, thisArg, args) {
        this.validateDisposal();

        if (!utils.isString(refId)) {
            throw new Error("refId must be a string.");
        }

        /** @type {Donuts.Remote.IDataInfo} */
        const thisArgDataInfo = this.dataInfoManager.toDataInfo(thisArg);

        /** @type {Array.<Donuts.Remote.IDataInfo>} */
        const argsDataInfo = [];

        if (Array.isArray(args)) {
            for (const arg of args) {
                argsDataInfo.push(this.dataInfoManager.toDataInfo(arg));
            }
        }

        /** @type {Donuts.Remote.IResourceApplyMessage} */
        const resourceMsg = {
            action: "Resource.Apply",
            refId: refId,
            thisArg: thisArgDataInfo,
            args: argsDataInfo
        };

        /** @type {Donuts.Remote.IDataInfo} */
        const resultDataInfo = await this.communicator.sendAsync(this.routePattern.getRaw(), resourceMsg);

        return this.dataInfoManager.realizeDataInfo(resultDataInfo);
    }

    /**
     * @public
     * @template T
     * @param {string} refId
     * @param {string | number} property
     * @returns {Promise<T>}
     */
    async getPropertyAsync(refId, property) {
        this.validateDisposal();

        if (!utils.isString(refId)) {
            throw new Error("refId must be a string.");
        }

        if (!utils.isString(property) && !utils.isNumber(property)) {
            throw new Error("property must be either a string or a number.");
        }

        /** @type {Donuts.Remote.IResourceGetPropertyMessage} */
        const resourceMsg = {
            action: "Resource.GetProperty",
            refId: refId,
            property: property
        };

        /** @type {Donuts.Remote.IDataInfo} */
        const resultDataInfo = await this.communicator.sendAsync(this.routePattern.getRaw(), resourceMsg);

        return this.dataInfoManager.realizeDataInfo(resultDataInfo);
    }

    /**
     * @public
     * @param {string} refId
     * @param {string | number} property
     * @param {*} value
     * @returns {Promise<boolean>}
     */
    async setPropertyAsync(refId, property, value) {
        this.validateDisposal();

        if (!utils.isString(refId)) {
            throw new Error("refId must be a string.");
        }

        if (!utils.isString(property) && !utils.isNumber(property)) {
            throw new Error("property must be either a string or a number.");
        }

        /** @type {Donuts.Remote.IResourceSetPropertyMessage} */
        const resourceMsg = {
            action: "Resource.SetProperty",
            refId: refId,
            property: property,
            value: this.dataInfoManager.toDataInfo(value)
        };

        /** @type {Donuts.Remote.IDataInfo} */
        const resultDataInfo = await this.communicator.sendAsync(this.routePattern.getRaw(), resourceMsg);

        return this.dataInfoManager.realizeDataInfo(resultDataInfo);
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    async disposeAsync() {
        if (this._communicator) {
            this.communicator.unmap(this.routePattern);

            if (this.ownCommunicator) {
                await this._communicator.disposeAsync();
            }

            this._communicator = undefined;
        }
    }

    /**
     * @private
     * @param {string} name 
     * @param {...*} extraArgs 
     * @returns {Promise.<*>}
     */
    resolveAsync(name, ...extraArgs) {
        if (utils.isFunction(this.resolver)) {
            return this.resolver(this, name, ...extraArgs);
        }

        return undefined;
    }

    /**
     * @private
     * @returns {void}
     */
    validateDisposal() {
        if (this._communicator) {
            return;
        }

        throw new Error(`Proxy (${this.id}) already disposed.`);
    }

    /**
     * @private
     * @returns {void}
     */
    initializeMessageHandlers() {
        this.messageHandlers["Resource.Request"] = this.onRequestResourceAsync;
        this.messageHandlers["Resource.Release"] = this.onReleaseResourceAsync;
        this.messageHandlers["Resource.GetProperty"] = this.onGetPropertyAsync;
        this.messageHandlers["Resource.SetProperty"] = this.onSetPropertyAsync;
        this.messageHandlers["Resource.Apply"] = this.onApplyAsync;
    }
}
exports.ObjectRemotingProxy = ObjectRemotingProxy;

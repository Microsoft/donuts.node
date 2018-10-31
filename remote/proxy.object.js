//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const uuidv4 = require("uuid/v4");
const utils = require("donuts.node/utils");
const weak = require("donuts.node-weak");

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
     * @template T
     * @param {string} identifier 
     * @param  {...*} extraArgs 
     * @returns {Promise<T>}
     */
    async requestAsync(identifier, ...extraArgs) {
        this.validateDisposal();

        const tempReferer = this.dataInfoManager.referAsDataInfo(() => undefined);

        try {
            const extraArgsDataInfos = extraArgs.map((arg) => this.dataInfoManager.referAsDataInfo(arg, tempReferer.id));

            const targetDataInfo: IDataInfo =
                await this.communicator.sendAsync<IRequestResourceProxyMessage, IDataInfo>(
                    this.pathPattern.getRaw(),
                    {
                        action: ProxyActionType.RequestResource,
                        resourceId: identifier,
                        extraArgs: extraArgsDataInfos
                    });
            const target = this.dataInfoManager.realizeDataInfo(targetDataInfo);

            if (targetDataInfo.id) {
                extraArgsDataInfos.forEach((argDataInfo) => {
                    if (argDataInfo.id) {
                        this.dataInfoManager.addReferenceById(argDataInfo.id, targetDataInfo.id);
                    }
                });
            }

            return target;
        } finally {
            await this.dataInfoManager.releaseByIdAsync(tempReferer.id);
        }
    }

    /**
     * @public
     * @param {Donuts.Remote.Resolver} resolver 
     * @returns {void}
     */
    setResolver(resolver) {
        this.validateDisposal();

        if (resolver && !utils.isFunction(resolver)) {
            throw new Error("resolver must be a function.");
        }

        this.resolver = resolver;
    }

    /**
     * @public
     * @returns {Donuts.Remote.Resolver}
     */
    getResolver() {
        this.validateDisposal();
        return this.resolver;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get disposed() {
        return !this.messageHandlers || !this.dataInfoManager;
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
     * @returns {void}
     */
    dispose() {
        if (!this.disposed) {
            this.communicator.unmap(this.pathPattern);
            this.dataInfoManager.disposeAsync();

            if (this.ownCommunicator) {
                this._communicator.dispose();
            }

            this._communicator = undefined;
            this.messageHandlers = undefined;
            this.dataInfoManager = undefined;
        }
    }

    /**
     * @public
     * @param {DelegationType} type 
     * @param {IDelegateMessage} msg 
     * @returns {Promise.<IDataInfo>}
     */
    delegateAsync(type, msg) {
        return this.communicator.sendAsync<IDelegationProxyMessage, IDataInfo>(
            this.pathPattern.getRaw(),
            {
                action: ProxyActionType.Delegate,
                delegateType: type,
                content: msg
            });
    }

    /**
     * @public
     * @param {Donuts.Remote.IRoutePattern} pathPattern 
     * @param {Donuts.Remote.ICommunicator} communicator 
     * @param {boolean} [ownCommunicator=false]
     * @param {string} [proxyId]
     */
    constructor(pathPattern, communicator, ownCommunicator, proxyId) {
        if (!utils.isObject(pathPattern)) {
            throw new Error("pathPattern must be provided.");
        }

        if (utils.isNullOrUndefined(communicator)) {
            throw new Error("communicator must be provided.");
        }

        /**
         * @public
         * @readonly
         * @type {string}
         */
        this.id = proxyId || uuidv4();

        /**
         * @private
         * @readonly
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
        this.pathPattern = pathPattern;

        /**
         * @private
         * @readonly
         * @type {Donuts.IDictionary.<Donuts.Remote.AsyncRequestHandler>}
         */
        this.messageHandlers = Object.create(null);

        /**
         * @private
         * @readonly
         * @type {Donuts.Remote.DataInfoManager}
         */
        this.dataInfoManager = new DataInfoManager(new Delegation(this));
        this.initializeMessageHandlers();

        this.communicator.map(this.pathPattern, this.onMessage);
    }

    /**
     * @private
     * @param {string} name 
     * @param {...*} extraArgs 
     * @returns {Promise.<*>}
     */
    resolveAsync(name, ...extraArgs) {
        if (this.resolver) {
            return this.resolver(this, name, ...extraArgs);
        }

        return undefined;
    }

    /**
     * @private
     * @returns {void}
     */
    validateDisposal() {
        if (this.disposed) {
            throw new Error(`Proxy (${this.id}) already disposed.`);
        }
    }

    /**
     * @private
     * @returns {void}
     */
    initializeMessageHandlers() {
        this.messageHandlers[ProxyActionType.RequestResource] = this.onRequestResourceAsync;
        this.messageHandlers[ProxyActionType.Delegate] = this.onDelegateAsync;
    }

    /**
     * @private
     * @param {Donuts.Remote.ICommunicator} communicator
     * @param {Donuts.Remote.IRoutePathInfo} pathInfo
     * @param {Donuts.Remote.IProxyMessage} proxyMsg
     * @returns {Promise<*>}
     */
    onMessage = (communicator, pathInfo, proxyMsg) => {
        if (!isProxyMessage(proxyMsg)) {
            // Log Error.
            return Promise.resolve();
        }

        const asyncRequestHandler = this.messageHandlers[proxyMsg.action];

        if (!asyncRequestHandler) {
            // Log Error.
            return Promise.resolve();
        }

        return asyncRequestHandler(communicator, path, proxyMsg);
    }

    /**
     * @private
     * @param {Donuts.Remote.ICommunicator} communicator
     * @param {Donuts.Remote.IRoutePathInfo} pathInfo
     * @param {IDelegationProxyMessage} msg
     * @returns {Promise<*>}
     */
    onDelegateAsync = (communicator, pathInfo, msg) => {
        switch (msg.delegateType) {
            case DelegationType.Apply:
                return this.onApplyAsync(communicator, pathInfo, msg);

            case DelegationType.Dispose:
                return this.onDisposeAsync(communicator, pathInfo, msg);

            case DelegationType.GetProperty:
                return this.onGetPropertyAsync(communicator, pathInfo, msg);

            case DelegationType.SetProperty:
                return this.onSetPropertyAsync(communicator, pathInfo, msg);

            default:
                throw new Error(`Unknown delegation type: ${msg.delegateType}`);
        }
    }

    /**
     * @private
     * @param {Donuts.Remote.ICommunicator} communicator
     * @param {Donuts.Remote.IRoutePathInfo} pathInfo
     * @param {Donuts.Remote.IDelegationProxyMessage} msg
     * @returns {Promise<*>}
     */
    onGetPropertyAsync = async (communicator, pathInfo, msg) => {
        /** @type {IPropertyDelegationMessage} */
        const delegationMsg = msg.content;
        const target = this.dataInfoManager.get(delegationMsg.refId);

        if (target === undefined) {
            throw new Error(`Target (${delegationMsg.refId}) doesn't exist.`);
        }

        return this.dataInfoManager.referAsDataInfo(await target[delegationMsg.property], delegationMsg.refId);
    }

    /**
     * @private
     * @param {Donuts.Remote.ICommunicator} communicator
     * @param {Donuts.Remote.IRoutePathInfo} pathInfo
     * @param {Donuts.Remote.IDelegationProxyMessage} msg
     * @returns {Promise<*>}
     */
    onSetPropertyAsync = async (communicator, pathInfo, msg) => {
        /** @type {ISetPropertyDelegationMessage} */
        const delegationMsg = msg.content;
        const target = this.dataInfoManager.get(delegationMsg.refId);

        if (target === undefined) {
            throw new Error(`Target (${delegationMsg.refId}) doesn't exist.`);
        }

        target[delegationMsg.property] = this.dataInfoManager.realizeDataInfo(delegationMsg.value, delegationMsg.refId);

        return true;
    }

    /**
     * @private
     * @param {Donuts.Remote.ICommunicator} communicator
     * @param {Donuts.Remote.IRoutePathInfo} pathInfo
     * @param {Donuts.Remote.IDelegationProxyMessage} msg
     * @returns {Promise<*>}
     */
    onApplyAsync = async (communicator, pathInfo, msg) => {
        /** @type {IApplyDelegationMessage} */
        const delegationMsg = msg.content;
        const target = this.dataInfoManager.get(delegationMsg.refId);

        if (target === undefined) {
            throw new Error(`Target (${delegationMsg.refId}) doesn't exist.`);
        }

        if (typeof target !== "function") {
            throw new Error(`Target (${delegationMsg.refId}) is not a function which cannot be applied.`);
        }

        const result =
            await target.call(
                this.dataInfoManager.realizeDataInfo(delegationMsg.thisArg, delegationMsg.refId),
                ...delegationMsg.args.map((item) => this.dataInfoManager.realizeDataInfo(item, delegationMsg.refId)));

        return this.dataInfoManager.referAsDataInfo(result, delegationMsg.refId);
    }

    /**
     * @private
     * @param {Donuts.Remote.ICommunicator} communicator
     * @param {Donuts.Remote.IRoutePathInfo} pathInfo
     * @param {Donuts.Remote.IDelegationProxyMessage} msg
     * @returns {Promise<*>}
     */
    onDisposeAsync = (communicator, pathInfo, msg) => {
        /** @type {IDisposeDelegateMessage} */
        const delegationMsg = msg.content;

        return this.dataInfoManager.releaseByIdAsync(delegationMsg.refId, delegationMsg.parentId, true);
    }

    /**
     * @private
     * @param {Donuts.Remote.ICommunicator} communicator
     * @param {Donuts.Remote.IRoutePathInfo} pathInfo
     * @param {Donuts.Remote.IRequestResourceProxyMessage} msg
     * @returns {Promise<*>}
     */
    onRequestResourceAsync = async (communicator, pathInfo, msg) => {
        const tempReferer = this.dataInfoManager.referAsDataInfo(() => undefined);
        const extraArgs = msg.extraArgs.map((argDataInfo) => this.dataInfoManager.realizeDataInfo(argDataInfo, tempReferer.id));

        const target = await this.resolveAsync(msg.resourceId, ...extraArgs);
        const targetDataInfo = this.dataInfoManager.referAsDataInfo(target);

        if (targetDataInfo.id) {
            msg.extraArgs.forEach((argDataInfo) => {
                if (argDataInfo.id) {
                    this.dataInfoManager.addReferenceById(argDataInfo.id, targetDataInfo.id);
                }
            });
        }

        await this.dataInfoManager.releaseByIdAsync(tempReferer.id);

        return targetDataInfo;
    }
}
exports.ObjectRemotingProxy = ObjectRemotingProxy;

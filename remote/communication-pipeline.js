//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { EventEmitter } = require("donuts.node/event-emitter");
const random = require("donuts.node/random");
const utils = require("donuts.node/utils");

/** @typedef {Donuts.Remote.ICommunicationSource} ICommunicationSource */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.ICommunicationPipeline<TOutgoingData, TIncomingData>} ICommunicationPipeline 
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.OutgoingAsyncHandler<TOutgoingData, TIncomingData>} OutgoingAsyncHandler 
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.IncomingAsyncHandler<TOutgoingData, TIncomingData>} IncomingAsyncHandler 
 */

/**
 * @template TData
 * @typedef {Donuts.Remote.IMessage<TData>} IMessage 
 */

/**
 * @typedef ITargetInfo
 * @property {string} targetName
 * @property {ICommunicationSource} [source]
 */

/**
 * @class
 * @template TOutgoingData, TIncomingData
 * @implements {ICommunicationPipeline<TOutgoingData, TIncomingData>}
 */
class CommunicationPipeline extends EventEmitter {
    /**
     * @public
     * @param {Donuts.Logging.ILog} log
     * @param {string} [id]
     * @param {string} [moduleName]
     */
    constructor(log, id, moduleName) {
        super();

        /**
         * @public
         * @readonly
         * @type {string}
         */
        this.id = id || random.generateUid();

        /**
         * @public
         * @type {TOutgoingData}
         */
        this.outgoingDataTemplate = undefined;

        /**
         * @public
         * @readonly
         * @type {Array<OutgoingAsyncHandler<TOutgoingData, TIncomingData>>}
         */
        this.outgoingPipe = [];

        /**
         * @public
         * @readonly
         * @type {Array<IncomingAsyncHandler<TOutgoingData, TIncomingData>>}
         */
        this.incomingPipe = [];

        /**
         * @protected
         * @readonly
         * @type {string}
         */
        this.moduleName = moduleName || "REMOTE";

        /**
         * @protected 
         * @readonly
         * @type {Donuts.Logging.ILog}
         */
        this.log = log;

        /**
         * @protected
         * @type {boolean}
         */
        this.disposed = false;

        /**
         * @private
         * @readonly
         * @type {Array<ICommunicationSource>}
         */
        this.sources = [];

        /**
         * @private
         * @readonly
         * @type {Donuts.IStringKeyDictionary<OutgoingAsyncHandler<TOutgoingData, TIncomingData>>}
         */
        this.targets = Object.create(null);

        /**
         * @private
         * @readonly
         * @type {Map<OutgoingAsyncHandler<TOutgoingData, TIncomingData>, ITargetInfo>}
         */
        this.targetInfoDictionary = new Map();

        /**
         * @private
         * @readonly
         * @param {ICommunicationSource} source
         * @param {IMessage<TIncomingData>} incomingMsg
         * @returns {void}
         */
        this.onIncomingMessage = (source, incomingMsg) => {
            this.emitIncomingMessageAsync(incomingMsg);
        };

        /**
         * @private
         * @readonly
         * @param {ICommunicationSource} source
         * @param {OutgoingAsyncHandler<TOutgoingData, TIncomingData>} targetAsyncHandler
         * @returns {void}
         */
        this.onTargetAcquired = (source, targetAsyncHandler) => {
            /** @type {ITargetInfo} */
            let targetInfo = this.targetInfoDictionary.get(targetAsyncHandler);

            if (!targetInfo) {
                targetInfo = Object.create(null);

                targetInfo.targetName= random.generateUid();
                targetInfo.source = source;
            }

            this.targetInfoDictionary.set(targetAsyncHandler, targetInfo);
            this.setTarget(targetInfo.targetName, targetAsyncHandler);
        };

        /**
         * @private
         * @readonly
         * @param {ICommunicationSource} source
         * @param {OutgoingAsyncHandler<TOutgoingData, TIncomingData>} targetAsyncHandler
         * @returns {void}
         */
        this.onTargetLost = (source, targetAsyncHandler) => {
            /** @type {ITargetInfo} */
            const targetInfo = this.targetInfoDictionary.get(targetAsyncHandler);

            if (!targetInfo) {
                return;
            }

            this.setTarget(targetInfo.targetName, undefined);
            this.targetInfoDictionary.delete(targetAsyncHandler);
        };
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    async disposeAsync() {
        if (this.outgoingPipe.length > 0) {
            this.outgoingPipe.splice(0);
        }

        if (this.incomingPipe.length > 0) {
            this.incomingPipe.splice(0);
        }

        if (this.disposed) {
            return;
        }

        if (this.sources.length > 0) {
            for (const source of this.sources) {
                source.off("message", this.onIncomingMessage);
            }

            this.sources.splice(0);
        }

        if (!utils.object.isEmpty(this.targets)) {
            for (const name in this.targets) {
                delete this.targets[name];
            }
        }

        this.disposed = true;
    }

    /**
     * @public
     * @param {ICommunicationSource} source
     * @return {this}
     */
    addSource(source) {
        this.validateDisposal();

        const index = this.sources.findIndex((item) => source === item);

        if (index < 0) {
            source.on("message", this.onIncomingMessage);
            source.on("target-acquired", this.onTargetAcquired);
            source.on("target-lost", this.onTargetLost);
            this.sources.push(source);
        }

        return this;
    }

    /**
     * @public
     * @param {ICommunicationSource} source
     * @return {this}
     */
    removeSource(source) {
        this.validateDisposal();

        const index = this.sources.findIndex((item) => source === item);

        if (index >= 0) {
            const source = this.sources.splice(index, 1)[0];

            source.off("message", this.onIncomingMessage);
            source.off("target-acquired", this.onTargetAcquired);
            source.off("target-lost", this.onTargetLost);

            for(const entry of this.targetInfoDictionary.entries()) {
                /** @type {ITargetInfo} */
                const targetInfo = entry[1];

                if (targetInfo.source === source) {
                    this.targetInfoDictionary.delete(entry[0]);
                }
            }
        }

        return this;
    }

    /**
     * @public
     * @return {Array.<ICommunicationSource>}
     */
    getSources() {
        this.validateDisposal();

        return Array.from(this.sources);
    }

    /**
     * @public
     * @param {string} name
     * @param {OutgoingAsyncHandler<TOutgoingData, TIncomingData>} target
     * @return {this}
     */
    setTarget(name, target) {
        this.validateDisposal();

        if (target === null || target === undefined) {
            delete this.targets[name];
        }

        if (!utils.isFunction(target)) {
            throw new Error("target must be a function.");
        }

        this.targets[name] = target;

        return this;
    }

    /**
     * @public
     * @param {string} name
     * @return {OutgoingAsyncHandler<TOutgoingData, TIncomingData>}
     */
    getTarget(name) {
        this.validateDisposal();

        return this.targets[name];
    }

    /**
     * @public
     * @return {Donuts.IStringKeyDictionary.<OutgoingAsyncHandler<TOutgoingData, TIncomingData>>}
     */
    getTargets() {
        this.validateDisposal();

        return Object.assign(Object.create(null), this.targets);
    }

    /**
     * @public
     * @param {TOutgoingData} data 
     * @param {string} [target]
     * @returns {Promise<TIncomingData>}
     */
    async pipeAsync(data, target) {
        this.validateDisposal();

        /** @type {IMessage<TOutgoingData>} */
        const outgoingMsg = this.generateOutgoingMessage(data);

        this.logMessage(outgoingMsg);

        /** @type {IMessage<TIncomingData>} */
        let incomingMsg = undefined;

        for (const asyncHandler of this.outgoingPipe) {
            try {
                incomingMsg = await asyncHandler(this, outgoingMsg);

            } catch (err) {
                this.logMessage(outgoingMsg, err && utils.isFunction(err.toString) ? err.toString() : JSON.stringify(err), "error");
                throw err;
            }

            if (incomingMsg) {
                break;
            }
        }

        if (!incomingMsg) {
            const targetAsyncHandler = this.targets[outgoingMsg.target];

            if (targetAsyncHandler) {
                incomingMsg = await targetAsyncHandler(this, outgoingMsg);
            }
        }

        if (!incomingMsg) {
            this.logMessage(outgoingMsg, "No outgoing handler or target handler handles the message.", "error");
            throw new Error("No outgoing handler or target handler handles the message.");
        }

        this.logMessage(incomingMsg);

        for (const asyncHandler of this.incomingPipe) {
            try {
                incomingMsg = await asyncHandler(this, outgoingMsg, incomingMsg);

            } catch (err) {
                this.logMessage(incomingMsg, err && utils.isFunction(err.toString) ? err.toString() : JSON.stringify(err), "error");
                throw err;
            }
        }

        this.logMessage(incomingMsg, "Incoming message processing completed.");

        return incomingMsg.data;
    }

    /**
     * @protected
     * @virtual
     * @param {IMessage<TIncomingData>} incomingMsg
     * @returns {Promise<void>}
     */
    async emitIncomingMessageAsync(incomingMsg) {
        this.logMessage(incomingMsg);

        for (const asyncHandler of this.incomingPipe) {
            try {
                incomingMsg = await asyncHandler(this, undefined, incomingMsg);

            } catch (err) {
                this.logMessage(incomingMsg, err && utils.isFunction(err.toString) ? err.toString() : JSON.stringify(err), "error");
                throw err;
            }
        }

        this.logMessage(incomingMsg, "Incoming message processing completed.");

        this.emit("data", this, incomingMsg.data);
    }

    /**
     * @protected
     * @virtual
     * @param {TOutgoingData} outgoingData 
     * @returns {IMessage<TOutgoingData>}
     */
    generateOutgoingMessage(outgoingData) {
        /** @type {IMessage<TOutgoingData>} */
        const outgoingMsg = Object.create(null);

        outgoingMsg.data = Object.assign(Object.assign(Object.create(null), this.outgoingDataTemplate), outgoingData);
        outgoingMsg.id = random.generateUid();
        outgoingMsg.source = this.id;
        outgoingMsg.operationId = random.generateUid();
        outgoingMsg.timestamp = Date.now();

        return outgoingMsg;
    }

    /**
     * @protected
     * @virtual
     * @param {IMessage<TOutgoingData | TIncomingData>} message
     * @param {string} [text]
     * @param {Donuts.Logging.Severity} [severity]
     * @returns {void}
     */
    logMessage(message, text, severity) {
        if (!this.log) {
            return;
        }

        severity = severity || "info";

        /** @type {string} */
        let msg = "";

        if (message.id) {
            msg += " " + message.id;
        }

        if (typeof message.timestamp === "number") {
            msg += utils.string.format(" ~{,4:F0}", Date.now() - message.timestamp);
        }

        if (message.source && message.source !== this.id) {
            msg += " <= " + message.source;
        }

        if (message.target && message.target !== this.id) {
            msg += " => " + message.target;
        }

        if (text) {
            msg += ": " + text;
        }

        this.log.writeAsync(
            severity,
            "<{}>{,8} {}{,8}{}{}", // Format: <{Id}>{ModuleName} {OperationName}{OperationId?}{Msg?}
            this.id,
            this.moduleName,
            message.operationId ? `<${message.operationId}>` : "",
            message.operationName || "",
            message.operationDescription ? " " + message.operationDescription : "",
            msg);
    }

    /**
     * @protected
     * @returns {void}
     */
    validateDisposal() {
        if (this.disposed) {
            throw new Error("Already disposed.");
        }
    }
}
exports.CommunicationPipeline = CommunicationPipeline;
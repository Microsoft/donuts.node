//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const random = require("donuts.node/random");
const utils = require("donuts.node/utils");
const { CommunicationPipeline } = require("./communicator");

/** @typedef {Donuts.Remote.ICommunicationSource} ICommunicationSource */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.IMultiSourceCommunicationPipeline<TOutgoingData, TIncomingData>} IMultiSourceCommunicationPipeline 
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {import("./communicator").CommunicationPipeline<TOutgoingData, TIncomingData>} CommunicationPipeline 
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>} OutgoingMailAsyncHandler 
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.IncomingMailAsyncHandler<TOutgoingData, TIncomingData>} IncomingMailAsyncHandler 
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
 * @extends {CommunicationPipeline<TOutgoingData, TIncomingData>}
 * @implements {IMultiSourceCommunicationPipeline<TOutgoingData, TIncomingData>}
 */
class MultiSourceCommunicationPipeline
    extends CommunicationPipeline {
    /**
     * @public
     * @param {Donuts.Logging.ILog} log
     * @param {string} [id]
     * @param {string} [moduleName]
     */
    constructor(log, id, moduleName) {
        super(log, id, moduleName);

        /**
         * @private
         * @readonly
         * @type {Array<ICommunicationSource>}
         */
        this.sources = [];

        /**
         * @private
         * @readonly
         * @type {Donuts.IStringKeyDictionary<OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>>}
         */
        this.targets = Object.create(null);

        /**
         * @private
         * @readonly
         * @type {Map<OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>, ITargetInfo>}
         */
        this.targetInfoDictionary = new Map();

        /**
         * @private
         * @readonly
         * @param {ICommunicationSource} source
         * @param {IMessage<TIncomingData>} incomingMsg
         * @returns {void}
         */
        this.onincomingMail = (source, incomingMsg) => {
            this.emitincomingMailAsync(incomingMsg);
        };

        /**
         * @private
         * @readonly
         * @param {ICommunicationSource} source
         * @param {OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>} targetAsyncHandler
         * @returns {void}
         */
        this.onTargetAcquired = (source, targetAsyncHandler) => {
            /** @type {ITargetInfo} */
            let targetInfo = this.targetInfoDictionary.get(targetAsyncHandler);

            if (!targetInfo) {
                targetInfo = Object.create(null);

                targetInfo.targetName = random.generateUid();
                targetInfo.source = source;
            }

            this.targetInfoDictionary.set(targetAsyncHandler, targetInfo);
            this.setTarget(targetInfo.targetName, targetAsyncHandler);
        };

        /**
         * @private
         * @readonly
         * @param {ICommunicationSource} source
         * @param {OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>} targetAsyncHandler
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
        if (this.disposed) {
            return;
        }

        if (this.sources.length > 0) {
            for (const source of this.sources) {
                source.off("message", this.onincomingMail);
            }

            this.sources.splice(0);
        }

        if (!utils.object.isEmpty(this.targets)) {
            for (const name in this.targets) {
                delete this.targets[name];
            }
        }

        super.disposeAsync();
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
        const outgoingMsg = this.generateoutgoingMail(data);

        this.logMessage(outgoingMsg);

        /** @type {IMessage<TIncomingData>} */
        let incomingMsg = await this.PipeToOutgoingPipeAsync(outgoingMsg);

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

        incomingMsg = await this.PipeToIncomingPipeAsync(outgoingMsg, incomingMsg);

        this.logMessage(incomingMsg, "Incoming message processing completed.");

        return incomingMsg.data;
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
            source.on("message", this.onincomingMail);
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

            source.off("message", this.onincomingMail);
            source.off("target-acquired", this.onTargetAcquired);
            source.off("target-lost", this.onTargetLost);

            for (const entry of this.targetInfoDictionary.entries()) {
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
     * @param {OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>} target
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
     * @return {OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>}
     */
    getTarget(name) {
        this.validateDisposal();

        return this.targets[name];
    }

    /**
     * @public
     * @return {Donuts.IStringKeyDictionary.<OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>>}
     */
    getTargets() {
        this.validateDisposal();

        return Object.assign(Object.create(null), this.targets);
    }
}
exports.MultiSourceCommunicationPipeline = MultiSourceCommunicationPipeline;
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const random = require("donuts.node/random");
const utils = require("donuts.node/utils");
const { PostBox } = require("./postbox");

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.IPostBox<TOutgoingData, TIncomingData>} IPostBox 
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.IPostMaster<TOutgoingData, TIncomingData>} IPostMaster 
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.IPostalCarrier<TOutgoingData, TIncomingData>} IPostalCarrier 
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>} OutgoingMailAsyncHandler 
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.IncomingMailAsyncHandler<TOutgoingData, TIncomingData>} IncomingMailAsyncHandler 
 */

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail 
 */

/**
 * @typedef IPostBoxInfo 
 * @property {IPostalCarrier<any, any>} carrier
 * @property {string} origin 
 */

/**
 * @class
 * @template TOutgoingData, TIncomingData
 * @extends {PostBox<TOutgoingData, TIncomingData>}
 * @implements {IPostMaster<TOutgoingData, TIncomingData>}
 */
class PostMaster extends PostBox {
    /**
     * @public
     * @param {Donuts.Logging.ILog} log
     * @param {string} [id]
     * @param {string} [moduleName]
     */
    constructor(log, id, moduleName) {
        super(log, id, moduleName);

        /**
         * @public
         * @readonly
         * @type {Donuts.IStringKeyDictionary<IPostBox<TOutgoingData, TIncomingData>>}
         */
        this.postboxes = Object.create(null);

        /**
         * @private
         * @readonly
         * @type {Array<IPostalCarrier<TOutgoingData, TIncomingData>>}
         */
        this.carriers = [];

        /**
         * @private
         * @readonly
         * @type {Map<IPostBox<TOutgoingData, TIncomingData>, IPostBoxInfo>}
         */
        this.postboxInfos = new Map();

        /**
         * @private
         * @readonly
         * @param {IPostalCarrier<TOutgoingData, TIncomingData>} carrier
         * @param {IPostBox<TOutgoingData, TIncomingData>} postbox
         * @param {IMail<TIncomingData>} incomingMail
         * @returns {Promise<IMail<TOutgoingData>>}
         */
        this.onIncomingMail = async (carrier, postbox, incomingMail) => {
            incomingMail = await this.PipeToIncomingPipeAsync(undefined, incomingMail);

            this.emit("mail", this, postbox, incomingMail);
        };

        /**
         * @private
         * @readonly
         * @param {IPostalCarrier<TOutgoingData, TIncomingData>} carrier
         * @param {IPostBox<TOutgoingData, TIncomingData>} postbox
         * @returns {void}
         */
        this.onTargetAcquired = (carrier, postbox) => {
            /** @type {IPostBoxInfo} */
            let postboxInfo = this.postboxInfos.get(postbox);

            if (!postboxInfo) {
                postboxInfo = Object.create(null);

                postboxInfo.origin = random.generateUid();
                postboxInfo.carrier = carrier;
            }

            this.postboxInfos.set(postbox, postboxInfo);
            this.postboxes[postboxInfo.origin] = postbox;
        };

        /**
         * @private
         * @readonly
         * @param {IPostalCarrier<TOutgoingData, TIncomingData>} carrier
         * @param {IPostBox<TOutgoingData, TIncomingData>} postbox
         * @returns {void}
         */
        this.onTargetLost = (carrier, postbox) => {
            /** @type {IPostBoxInfo} */
            const postboxInfo = this.postboxInfos.get(postbox);

            if (!postboxInfo) {
                return;
            }
            
            delete this.postboxes[postboxInfo.origin];
            this.postboxInfos.delete(postbox);
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

        if (this.carriers.length > 0) {
            for (const source of this.carriers) {
                source.off("mail", this.onIncomingMail);
                source.off("postbox-acquired", this.onTargetAcquired);
                source.off("postbox-lost", this.onTargetLost);
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
exports.PostMaster = PostMaster;
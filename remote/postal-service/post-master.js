//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const random = require("donuts.node/random");
const utils = require("donuts.node/utils");
const { PostBox } = require("./post-box");

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
     * @param {Donuts.Logging.ILog} [log]
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
        this.onIncomingMailAsync = async (carrier, postbox, incomingMail) => {
            incomingMail = await this.PipeToIncomingPipeAsync(undefined, incomingMail);

            return this.emit("mail", this, carrier, postbox, incomingMail);
        };

        /**
         * @private
         * @readonly
         * @param {IPostalCarrier<TOutgoingData, TIncomingData>} carrier
         * @param {IPostBox<TOutgoingData, TIncomingData>} postbox
         * @returns {void}
         */
        this.onPostBoxAcquired = (carrier, postbox) => {
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
        this.onPostBoxLost = (carrier, postbox) => {
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
     * @param {IMail<TOutgoingData>} outgoingMail 
     * @returns {Promise<IMail<TIncomingData>>}
     */
    async sendMailAsync(outgoingMail) {
        this.validateDisposal();

        outgoingMail = this.generateOutgoingMail(outgoingMail);
        outgoingMail.cid = random.generateUid();

        this.logMessage(outgoingMail);

        /** @type {IMail<TIncomingData>} */
        let incomingMail = await this.PipeToOutgoingPipeAsync(outgoingMail);

        if (!incomingMail && outgoingMail.to instanceof URL) {
            const postbox = this.postboxes[outgoingMail.to.origin];

            incomingMail = await postbox.sendMailAsync(outgoingMail);
        }

        if (!incomingMail) {
            this.logMessage(outgoingMail, "No outgoing handler or carrier handles the message.", "error");
            throw new Error("No outgoing handler or carrier handles the message.");
        }

        this.logMessage(incomingMail);

        incomingMail = await this.PipeToIncomingPipeAsync(outgoingMail, incomingMail);

        this.logMessage(incomingMail, "Incoming message processing completed.");

        return incomingMail;
    }

    /**
     * @public
     * @param {IMail<TOutgoingData>} outgoingMail 
     * @returns {Promise<void>}
     */
    async dropMailAsync(outgoingMail) {
        this.validateDisposal();

        outgoingMail = this.generateOutgoingMail(outgoingMail);

        delete outgoingMail.cid;

        this.logMessage(outgoingMail);

        /** @type {any} */
        let result = await this.PipeToOutgoingPipeAsync(outgoingMail);

        if (result === undefined && outgoingMail.to instanceof URL) {
            const postbox = this.postboxes[outgoingMail.to.origin];

            result = await postbox.dropMailAsync(outgoingMail);
        }

        if (result === undefined) {
            this.logMessage(outgoingMail, "No outgoing handler or carrier handles the message.", "error");
            throw new Error("No outgoing handler or carrier handles the message.");
        }
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    disposeAsync() {
        if (this.disposed) {
            return;
        }

        if (this.carriers.length > 0) {
            for (const carrier of this.carriers) {
                carrier.off("mail", this.onIncomingMailAsync);
                carrier.off("postbox-acquired", this.onPostBoxAcquired);
                carrier.off("postbox-lost", this.onPostBoxLost);
            }

            this.carriers.splice(0);
        }

        if (!utils.object.isEmpty(this.postboxes)) {
            for (const name in this.postboxes) {
                delete this.postboxes[name];
            }

            this.postboxInfos.clear();
        }

        return super.disposeAsync();
    }

    /**
     * @public
     * @param {IPostalCarrier<TOutgoingData, TIncomingData>} carrier
     * @return {this}
     */
    addCarrier(carrier) {
        this.validateDisposal();

        const index = this.carriers.findIndex((item) => carrier === item);

        if (index < 0) {
            carrier.on("mail", this.onIncomingMailAsync);
            carrier.on("postbox-acquired", this.onPostBoxAcquired);
            carrier.on("postbox-lost", this.onPostBoxLost);
            this.carriers.push(carrier);
        }

        return this;
    }

    /**
     * @public
     * @param {IPostalCarrier<TOutgoingData, TIncomingData>} carrier
     * @return {this}
     */
    removeCarrier(carrier) {
        this.validateDisposal();

        const index = this.carriers.findIndex((item) => carrier === item);

        if (index >= 0) {
            this.carriers.splice(index, 1);

            carrier.off("mail", this.onIncomingMailAsync);
            carrier.off("postbox-acquired", this.onPostBoxAcquired);
            carrier.off("postbox-lost", this.onPostBoxLost);

            for (const entry of this.postboxInfos.entries()) {
                /** @type {IPostBoxInfo} */
                const postboxInfo = entry[1];

                if (postboxInfo.carrier === carrier) {
                    this.postboxInfos.delete(entry[0]);
                }
            }
        }

        return this;
    }

    /**
     * @public
     * @return {Array.<IPostalCarrier<TOutgoingData, TIncomingData>>}
     */
    getCarriers() {
        this.validateDisposal();

        return Array.from(this.carriers);
    }
}
exports.PostMaster = PostMaster;
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.IPostBox<TOutgoingData, TIncomingData>} IPostBox 
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>} OutgoingMailAsyncHandler 
 */

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail 
 */

const random = require("donuts.node/random");
const utils = require("donuts.node/utils");
const { PostBox } = require("./post-box");

/**
 * @class
 * @template TOutgoingData, TIncomingData
 * @implements {IPostBox<TOutgoingData, TIncomingData>}
 */
class SimplePostBox {
    /**
     * @public
     * @param {OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>} outgoingMailAsyncHandler
     * @param {() => Promise<void>} [disposeAsyncHandler]
     * @param {Donuts.Logging.ILog} [log]
     * @param {string} [id]
     * @param {string} [moduleName]
     */
    constructor(outgoingMailAsyncHandler, disposeAsyncHandler, log, id, moduleName) {
        if (!utils.isFunction(outgoingMailAsyncHandler)) {
            throw new Error("outgoingMailAsyncHandler must be a valid function.");
        }

        if (disposeAsyncHandler && !utils.isFunction(disposeAsyncHandler)) {
            throw new Error("outgoingMailAsyncHandler must be a valid function.");
        }

        /**
         * @public
         * @type {IMail<TOutgoingData>}
         */
        this.outgoingMailTemplate = undefined;

        /**
         * @private
         * @readonly
         * @type {OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>}
         */
        this.outgoingMailAsyncHandler = outgoingMailAsyncHandler;

        /**
         * @private
         * @readonly
         * @type {() => Promise<void>}
         */
        this.disposeAsyncHandler = disposeAsyncHandler;

        /**
         * @public
         * @readonly
         * @type {string}
         */
        this.id = id || random.generateUid();

        /**
         * @private
         * @readonly
         * @type {string}
         */
        this.moduleName = moduleName || "REMOTE";

        /**
        * @private 
        * @readonly
        * @type {Donuts.Logging.ILog}
        */
        this.log = log;

        /**
         * @private
         * @type {boolean}
         */
        this.disposed = false;
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    async disposeAsync() {
        if (this.disposed) {
            return;
        }

        this.disposed = true;

        if (this.disposeAsyncHandler) {
            await this.disposeAsyncHandler();
        }
    }

    /**
     * @public
     * @param {IMail<TOutgoingData>} outgoingMail 
     * @returns {Promise<IMail<TIncomingData>>}
     */
    sendMailAsync(outgoingMail) {
        this.validateDisposal();

        if (!outgoingMail) {
            throw new Error("outgoingMail must be a valid IMail.");
        }

        return this._sendMailAsync(this.finalizeOutgoingMail(outgoingMail));
    }

    /**
     * @public
     * @param {IMail<TOutgoingData>} outgoingMail 
     * @returns {Promise<void>}
     */
    dropMailAsync(outgoingMail) {
        this.validateDisposal();

        if (!outgoingMail) {
            throw new Error("outgoingMail must be a valid IMail.");
        }

        return this._dropMailAsync(this.finalizeOutgoingMail(outgoingMail));
    }

    /**
     * @public
     * @param {TOutgoingData} data 
     * @param {URL} [to]
     * @param {string} [type]
     * @returns {Promise<TIncomingData>}
     */
    async sendAsync(data, to, type) {
        const incomingMail = await this._sendMailAsync(this.generateOutgoingMail(data, to, type));

        return incomingMail.data;
    }

    /**
     * @public
     * @param {TOutgoingData} data 
     * @param {URL} [to]
     * @param {string} [type]
     * @returns {Promise<void>}
     */
    dropAsync(data, to, type) {
        return this._dropMailAsync(this.generateOutgoingMail(data, to, type));
    }

    /**
     * @private
     * @param {IMail<TOutgoingData>} outgoingMail 
     * @returns {Promise<IMail<TIncomingData>>}
     */
    async _sendMailAsync(outgoingMail) {
        this.validateDisposal();

        if (!outgoingMail) {
            throw new Error("outgoingMail must be a valid IMail.");
        }

        outgoingMail.cid = random.generateUid();

        this.logMessage(outgoingMail);

        /** @type {IMail<TIncomingData>} */
        let incomingMail = await this.outgoingMailAsyncHandler(this, outgoingMail);

        if (!incomingMail) {
            this.logMessage(outgoingMail, "Outgoing handler doesn't handle the message.", "error");
            throw new Error("Outgoing handler doesn't handle the message.");
        }

        this.logMessage(incomingMail);

        return incomingMail;
    }

    /**
     * @private
     * @param {IMail<TOutgoingData>} outgoingMail 
     * @returns {Promise<void>}
     */
    async _dropMailAsync(outgoingMail) {
        this.validateDisposal();

        if (!outgoingMail) {
            throw new Error("outgoingMail must be a valid IMail.");
        }

        delete outgoingMail.cid;

        this.logMessage(outgoingMail);

        await this.outgoingMailAsyncHandler(this, outgoingMail);
    }

    /**
     * @private
     * @virtual
     * @param {IMail<TOutgoingData>} mail 
     * @returns {IMail<TOutgoingData>}
     */
    finalizeOutgoingMail(mail) {
        /** @type {IMail<TOutgoingData>} */
        const outgoingMail =
            Object.assign(
                Object.create(Object.getPrototypeOf(mail) || Object.getPrototypeOf(this.outgoingMailTemplate)),
                this.outgoingMailTemplate,
                mail);

        outgoingMail.id = random.generateUid();
        outgoingMail.timestamp = Date.now();

        return outgoingMail;
    }

    /**
     * @private
     * @virtual
     * @param {TOutgoingData} data
     * @param {URL} [to]
     * @param {string} [type]
     * @returns {IMail<TOutgoingData>}
     */
    generateOutgoingMail(data, to, type) {
        /** @type {IMail<TOutgoingData>} */
        const outgoingMail =
            Object.assign(
                Object.create(Object.getPrototypeOf(this.outgoingMailTemplate)),
                this.outgoingMailTemplate);

        outgoingMail.id = random.generateUid();
        outgoingMail.timestamp = Date.now();
        outgoingMail.data = data;

        if (to instanceof URL) {
            outgoingMail.to = to;
        }

        if (type && typeof type === "string") {
            outgoingMail.type = type;
        }

        return outgoingMail;
    }

    /**
     * @private
     * @virtual
     * @param {IMail<TOutgoingData | TIncomingData>} message
     * @param {string} [text]
     * @param {Donuts.Logging.Severity} [severity]
     * @returns {void}
     */
    logMessage(message, text, severity) {
        PostBox.logMessage(this.log, this.id, this.moduleName, message, text, severity);
    }

    /**
     * @private
     * @returns {void}
     */
    validateDisposal() {
        if (this.disposed) {
            throw new Error("Already disposed.");
        }
    }
}
exports.SimplePostBox = SimplePostBox;
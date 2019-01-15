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
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.IncomingMailAsyncHandler<TOutgoingData, TIncomingData>} IncomingMailAsyncHandler 
 */

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail 
 */

/** @typedef {import("donuts.node/event-emitter").EventEmitter} EventEmitter */

const random = require("donuts.node/random");
const utils = require("donuts.node/utils");
const { EventEmitter } = require("donuts.node/event-emitter");
const { Logger } = require("./logger");

/**
 * @class
 * @template TOutgoingData, TIncomingData
 * @extends {EventEmitter}
 * @implements {IPostBox<TOutgoingData, TIncomingData>}
 */
class Postbox extends EventEmitter {
    /**
     * @public
     * @param {Donuts.Logging.ILog} [log]
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
         * @type {IMail<TOutgoingData>}
         */
        this.outgoingMailTemplate = undefined;

        /**
         * @public
         * @readonly
         * @type {Array<OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>>}
         */
        this.outgoingPipe = [];

        /**
         * @public
         * @readonly
         * @type {Array<IncomingMailAsyncHandler<TOutgoingData, TIncomingData>>}
         */
        this.incomingPipe = [];

        /**
         * @protected 
         * @readonly
         * @type {import("./logger").Logger}
         */
        this.log = new Logger(log, this.id, moduleName || "REMOTE");

        /**
         * @protected
         * @type {boolean}
         */
        this.disposed = false;
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    async disposeAsync() {
        this.disposed = true;

        if (this.outgoingPipe.length > 0) {
            this.outgoingPipe.splice(0);
        }

        if (this.incomingPipe.length > 0) {
            this.incomingPipe.splice(0);
        }

        this.outgoingMailTemplate = undefined;
    }

    /**
     * @public
     * @param {IMail<TOutgoingData>} outgoingMail 
     * @returns {Promise<IMail<TIncomingData>>}
     */
    async sendMailAsync(outgoingMail) {
        this.validateDisposal();

        if (!outgoingMail) {
            throw new Error("outgoingMail must be a valid IMail.");
        }

        outgoingMail = this.generateOutgoingMail(outgoingMail);
        outgoingMail.cid = random.generateUid();

        this.log.logMail(outgoingMail);

        /** @type {IMail<TIncomingData>} */
        let incomingMail = await this.PipeToOutgoingPipeAsync(outgoingMail);

        if (!incomingMail) {
            this.log.logMail(outgoingMail, "No outgoing handler or target handler handles the message.", "error");
            throw new Error("No outgoing handler or target handler handles the message.");
        }

        this.log.logMail(incomingMail);

        incomingMail = await this.PipeToIncomingPipeAsync(outgoingMail, incomingMail);

        this.log.logMail(incomingMail, "Incoming message processing completed.");

        return incomingMail;
    }

    /**
     * @public
     * @param {IMail<TOutgoingData>} outgoingMail 
     * @returns {void}
     */
    dropMail(outgoingMail) {
        this.validateDisposal();

        if (!outgoingMail) {
            throw new Error("outgoingMail must be a valid IMail.");
        }

        outgoingMail = this.generateOutgoingMail(outgoingMail);

        delete outgoingMail.cid;

        this.log.logMail(outgoingMail);
        this.PipeToOutgoingPipeAsync(outgoingMail);
    }

    /**
     * @public
     * @param {TOutgoingData} data 
     * @param {URL} [to]
     * @param {string} [type]
     * @returns {Promise<TIncomingData>}
     */
    async sendAsync(data, to, type) {
        /** @type {IMail<TOutgoingData>} */
        const outgoingMail = Object.create(null);

        outgoingMail.data = data;

        if (to instanceof URL) {
            outgoingMail.to = to;
        }

        if (type && typeof type === "string") {
            outgoingMail.type = type;
        }

        const incomingMail = await this.sendMailAsync(outgoingMail);

        return incomingMail.data;
    }

    /**
     * @public
     * @param {TOutgoingData} data 
     * @param {URL} [to]
     * @param {string} [type]
     * @returns {void}
     */
    drop(data, to, type) {
        /** @type {IMail<TOutgoingData>} */
        const outgoingMail = Object.create(null);

        outgoingMail.data = data;

        if (to instanceof URL) {
            outgoingMail.to = to;
        }

        if (type && typeof type === "string") {
            outgoingMail.type = type;
        }

        this.dropMail(outgoingMail);
    }

    /**
     * @protected
     * @virtual
     * @param {IMail<TOutgoingData>} outgoingMsg
     * @return {Promise<IMail<TIncomingData>>}
     */
    async PipeToOutgoingPipeAsync(outgoingMsg) {
        /** @type {IMail<TIncomingData>} */
        let incomingMsg = undefined;

        for (const asyncHandler of this.outgoingPipe) {
            try {
                incomingMsg = await asyncHandler(this, outgoingMsg);

            } catch (err) {
                this.log.logMailError(outgoingMsg, err);
                throw err;
            }

            if (incomingMsg) {
                break;
            }
        }

        return incomingMsg;
    }

    /**
     * @protected
     * @virtual
     * @param {IMail<TOutgoingData>} outgoingMsg
     * @param {IMail<TIncomingData>} incomingMsg
     * @return {Promise<IMail<TIncomingData>>}
     */
    async PipeToIncomingPipeAsync(outgoingMsg, incomingMsg) {
        for (const asyncHandler of this.incomingPipe) {
            try {
                incomingMsg = await asyncHandler(this, outgoingMsg, incomingMsg);

            } catch (err) {
                this.log.logMailError(incomingMsg, err);
                throw err;
            }
        }

        return incomingMsg;
    }

    /**
     * @protected
     * @virtual
     * @param {IMail<TOutgoingData>} mail 
     * @returns {IMail<TOutgoingData>}
     */
    generateOutgoingMail(mail) {
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
     * @protected
     * @returns {void}
     */
    validateDisposal() {
        if (this.disposed) {
            throw new Error("Already disposed.");
        }
    }
}
exports.Postbox = Postbox;
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/** @typedef {Donuts.Remote.PostalService.IPostBox} IPostBox */
/** @typedef {Donuts.Remote.PostalService.OutgoingMailAsyncHandler} OutgoingMailAsyncHandler */
/** @typedef {Donuts.Remote.PostalService.IncomingMailAsyncHandler} IncomingMailAsyncHandler */

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail 
 */

/** @typedef {import("donuts.node/event-emitter").EventEmitter} EventEmitter */

const random = require("donuts.node/random");
const { EventEmitter } = require("donuts.node/event-emitter");
const { Logger } = require("./logger");

/**
 * @class
 * @extends {EventEmitter}
 * @implements {IPostBox}
 */
class Postbox extends EventEmitter {
    /**
     * @public
     * @param {Donuts.Logging.ILog} [log]
     * @param {string} [id]
     */
    constructor(log, id) {
        super();

        /**
         * @public
         * @readonly
         * @type {string}
         */
        this.id = id || random.generateUid();

        /**
         * @public
         * @type {IMail<any>}
         */
        this.outgoingMailTemplate = undefined;

        /**
         * @public
         * @readonly
         * @type {Array<OutgoingMailAsyncHandler>}
         */
        this.outgoingPipe = [];

        /**
         * @public
         * @readonly
         * @type {Array<IncomingMailAsyncHandler>}
         */
        this.incomingPipe = [];

        /**
         * @protected 
         * @readonly
         * @type {import("./logger").Logger}
         */
        this.log = new Logger(log, this.id);

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
     * @template TIncomingData
     * @public
     * @param {IMail<any>} outgoingMail 
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
     * @param {IMail<any>} outgoingMail 
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
     * @param {IMail<any>} mail 
     * @returns {Promise<IMail<any>>}
     */
    async deliverMailAsync(mail) {

    }

    /**
     * @template TIncomingData
     * @public
     * @param {any} data 
     * @param {URL} [to]
     * @returns {Promise<TIncomingData>}
     */
    async sendAsync(data, to) {
        /** @type {IMail<any>} */
        const outgoingMail = Object.create(null);

        outgoingMail.data = data;

        if (to instanceof URL) {
            outgoingMail.to = to;
        }

        const incomingMail = await this.sendMailAsync(outgoingMail);

        return incomingMail.data;
    }

    /**
     * @public
     * @param {any} data 
     * @param {URL} [to]
     * @returns {void}
     */
    drop(data, to) {
        /** @type {IMail<any>} */
        const outgoingMail = Object.create(null);

        outgoingMail.data = data;

        if (to instanceof URL) {
            outgoingMail.to = to;
        }
        
        this.dropMail(outgoingMail);
    }

    /**
     * @protected
     * @virtual
     * @param {IMail<any>} outgoingMsg
     * @return {Promise<IMail<any>>}
     */
    async PipeToOutgoingPipeAsync(outgoingMsg) {
        /** @type {IMail<any>} */
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
     * @param {IMail<any>} outgoingMsg
     * @param {IMail<any>} incomingMsg
     * @return {Promise<IMail<any>>}
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
     * @param {IMail<any>} mail 
     * @returns {IMail<any>}
     */
    generateOutgoingMail(mail) {
        /** @type {IMail<any>} */
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
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/** @typedef {Donuts.Remote.PostalService.IPostBox} IPostBox */
/** @typedef {Donuts.Remote.PostalService.IPostalError} IPostError */
/** @typedef {Donuts.Remote.PostalService.OutgoingMailAsyncHandler} OutgoingMailAsyncHandler */
/** @typedef {Donuts.Remote.PostalService.IncomingMailAsyncHandler} IncomingMailAsyncHandler */

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail 
 */

/** @typedef {import("donuts.node/event-emitter").EventEmitter} EventEmitter */

const random = require("donuts.node/random");
const { EventEmitter } = require("donuts.node/event-emitter");

/**
 * @class
 * @abstract
 * @extends {EventEmitter}
 * @implements {IPostBox}
 */
class Postal extends EventEmitter {
    /**
     * @public
     * @param {URL} [url]
     */
    constructor(url) {
        super();

        /**
         * @public
         * @readonly
         * @type {string}
         */
        this.id = random.generateUid();

        /**
         * @public 
         * @readonly
         * @type {URL}
         */
        this.url = url || null;

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

        if (this.outgoingPipe && this.outgoingPipe.length > 0) {
            this.outgoingPipe.splice(0);
        }

        if (this.incomingPipe && this.incomingPipe.length > 0) {
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

        /** @type {IMail<TIncomingData>} */
        outgoingMail = await this.PipeToOutgoingPipeAsync(outgoingMail);

        let incomingMail = await this.doSendMailAsync(outgoingMail);

        return await this.PipeToIncomingPipeAsync(outgoingMail, incomingMail);
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

        this.PipeToOutgoingPipeAsync(outgoingMail)
            .then((outgoingMail) => this.doDropMail(outgoingMail));
    }

    /**
     * @public
     * @param {IMail<any>} mail 
     * @returns {Promise<IMail<any>>}
     */
    async deliverMailAsync(mail) {
        this.validateDisposal();

        const incomingMail = await this.PipeToIncomingPipeAsync(null, mail);

        return await this.emit("mail", this, incomingMail);
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
        for (const asyncHandler of this.outgoingPipe) {
            try {
                outgoingMsg = await asyncHandler(this, outgoingMsg) || outgoingMsg;

            } catch (err) {
                throw err;
            }
        }

        return outgoingMsg;
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
        outgoingMail.sentTime = Date.now();

        return outgoingMail;
    }

    /**
     * @protected
     * @abstract
     * @param {IMail<any>} outgoingMail
     * @returns {Promise<IMail<any>>}
     */
    async doSendMailAsync(outgoingMail) {
        throw new Error("Not implemented!");
    }

    /**
     * @protected
     * @abstract
     * @param {IMail<any>} outgoingMail
     * @returns {void}
     */
    doDropMail(outgoingMail) {
        throw new Error("Not implemented!");
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

    /**
     * @protected
     * @param {IMail<any>} mail
     * @returns {Promise<IMail<any>>}
     */
    emitMailAsync(mail) {
        return this.emit("mail", this, mail);
    }

    /**
     * @protected
     * @param {IPostError} error
     * @returns {void}
     */
    emitError(error) {
        this.emit("error", this, error);
    }
}
exports.Postal = Postal;
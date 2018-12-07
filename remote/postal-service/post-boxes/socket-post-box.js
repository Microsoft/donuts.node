//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/** @typedef {import("donuts.node/event-emitter").EventEmitter} EventEmitter */
/** @typedef {import("net").Socket} Socket */

/** 
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail 
 */

/**
 * @typedef IMailPromiseRecord
 * @property {(value?: any) => void} resolve 
 * @property {(reason?: any) => void} reject 
 */

const { EventEmitter } = require("donuts.node/event-emitter");
const { Socket } = require("net");
const random = require("donuts.node/random");

/**
 * @template TOutgoingData, TIncomingData
 * @class
 * @extends {EventEmitter}
 * @implements {ISource<TOutgoingData, TIncomingData>}
 */
class SocketPostBox extends EventEmitter {
    /**
     * @public
     * @param {string} origin
     * @param {Socket} socket
     * @param {number} [timeout] timeout in milliseconds.
     */
    constructor(origin, socket, timeout) {
        if (!(socket instanceof Socket)) {
            throw new Error("socket must be a valid net.Socket.");
        }

        if (typeof origin !== "string") {
            throw new Error("origin must be a string");
        }

        super();

        /**
         * @private
         * @readonly
         * @type {Socket}
         */
        this.socket = socket;

        /**
         * @private
         * @readonly
         * @type {number}
         */
        this.timeout = timeout;

        /**
         * @private
         * @readonly
         * @type {string}
         */
        this._origin = origin;

        /**
         * @private 
         * @type {string}
         */
        this.incomingBuffer = "";

        /**
         * @private
         * @readonly
         * @type {Donuts.IStringKeyDictionary<IMailPromiseRecord>}
         */
        this.mailDictionary = Object.create(null);

        /**
         * @private
         * @readonly
         * @param {Buffer | string} data
         * @returns {Promise<void>}
         */
        this.onData = async (data) => {
            try {
                if (Buffer.isBuffer(data)) {
                    data = data.toString("utf8");
                }

                this.incomingBuffer = this.incomingBuffer + data;

                const segmentEnd = this.incomingBuffer.indexOf(";");

                if (segmentEnd < 0) {
                    return;
                }

                const segments = this.incomingBuffer.split(";");

                for (let dataEntryIndex = 0; dataEntryIndex < segments.length - 1; dataEntryIndex++) {
                    const dataEntry = segments[dataEntryIndex];

                    if (!dataEntry) {
                        continue;
                    }

                    /** @type {IMail<any>} */
                    const incomingMail = JSON.parse(Buffer.from(dataEntry, "base64").toString("utf8"));

                    /** @type {IMailPromiseRecord} */
                    const mailPromiseRecord = this.mailDictionary[incomingMail.cid];

                    if (mailPromiseRecord) {
                        mailPromiseRecord.resolve(incomingMail);

                    } else {
                        /** @type {IMail<TOutgoingData>} */
                        let outgoingMail = await this.emit("mail", this, incomingMail);

                        if (incomingMail.cid) {

                            if (!outgoingMail) {
                                outgoingMail = Object.create(null);
                                outgoingMail.cid = incomingMail.cid;
                                outgoingMail.id = random.generateUid();
                                outgoingMail.from = incomingMail.to;
                                outgoingMail.to = incomingMail.from;
                                outgoingMail.data = undefined;
                            }

                            this.pushMail(outgoingMail);
                        }
                    }
                }

                this.incomingBuffer = segments.pop() || "";

            } catch (error) {
                Log.writeExceptionAsync(error);
                throw error;
            }
        };
    }

    /**
     * @public
     * @returns {string}
     */
    get origin() {
        return this._origin;
    }

    /**
     * @public
     * @param {IMail<TOutgoingData>} mail
     * @returns {Promise<IMail<TIncomingData>>}
     */
    sendAsync(mail) {

    }

    /**
     * @public
     * @param {IMail<TOutgoingData>} mail 
     * @returns {void}
     */
    dropMail(mail) {

    }

    /**
     * @public
     * @param {IMail<TOutgoingData>} mail 
     * @returns {void}
     */
    pushMail(mail) {

    }
}
exports.SocketPostBox = SocketPostBox;
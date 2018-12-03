//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

/** @typedef {import("net").Socket} NetSocket */

/** 
 * @template TOutgoingData, TIncommingData
 * @typedef {Donuts.Remote.ICommunicationPipeline<TOutgoingData, TIncommingData>} ICommunicationPipeline 
 */

/** @typedef {Donuts.Remote.ICommunicationSource} ICommunicationListener */

/** 
 * @template TData
 * @typedef {Donuts.Remote.IMessage<TData>} IMessage
 */

/**
 * @typedef IMsgPromiseRecord
 * @property {(value?: any) => void} resolve 
 * @property {(reason?: any) => void} reject 
 */

const { EventEmitter } = require("donuts.node/event-emitter");
const Log = require("donuts.node/logging").getLog();

/**
 * @class
 * @template TOutgoingData, TIncommingData
 * @implements {ICommunicationListener}
 */
class SocketAdapter extends EventEmitter {
    /**
     * @public
     * @param {NetSocket} socket
     * @param {number} [timeout]
     */
    constructor(socket, timeout) {
        const { Socket } = require("net");

        if (!(socket instanceof Socket)) {
            throw new Error("socket must be an instance of net.Socket");
        }

        super();

        /**
         * @private
         * @readonly
         * @type {NetSocket}
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
         * @type {Donuts.IStringKeyDictionary<IMsgPromiseRecord>}
         */
        this.msgDictionary = Object.create(null);

        /**
         * @private
         * @type {string}
         */
        this.incomingBuffer = "";

        /**
         * @private
         * @readonly
         * @param {Buffer | string} data
         */
        this.onData = (data) => {
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

                    /** @type {IMessage<any>} */
                    const incomingMsg = JSON.parse(Buffer.from(dataEntry, "base64").toString("utf8"));

                    /** @type {IMsgPromiseRecord} */
                    const msgPromiseRecord = this.msgDictionary[incomingMsg.id];

                    if (!msgPromiseRecord) {
                        this.emit("message", this, incomingMsg);

                    } else {
                        msgPromiseRecord.resolve(incomingMsg);
                    }
                }

                this.incomingBuffer = segments.pop() || "";

            } catch (error) {
                Log.writeExceptionAsync(error);
                throw error;
            }
        };

        /**
         * @public
         * @readonly
         * @param {ICommunicationPipeline<TOutgoingData, TIncommingData>} pipeline
         * @param {IMessage<TOutgoingData>} outgoingMsg
         * @returns {Promise<IMessage<TIncommingData>>}
         */
        this.handleOutgoingMessage = async (pipeline, outgoingMsg) => {
            /** @type {IMessage<TOutgoingData>} */
            const msg = Object.assign(Object.create(null), outgoingMsg);

            delete msg.operationDescription;
            delete msg.operationId;
            delete msg.operationName;

            return new Promise((resolve, reject) => {
                /** @type {string} */
                const msgId = msg.id;

                /** @type {Donuts.IStringKeyDictionary<IMsgPromiseRecord>} */
                const msgDictionary = this.msgDictionary;

                /** @type {IMsgPromiseRecord} */
                const msgRecord = this.msgDictionary[msgId] = Object.create(null);

                msgRecord.reject = (reason) => {
                    delete msgDictionary[msgId];

                    reject(reason);
                };

                msgRecord.resolve = (value) => {
                    delete msgDictionary[msgId];

                    resolve(value);
                };

                if (typeof this.timeout === "number") {
                    setTimeout(() => msgRecord.reject(new Error(`Timed out (${this.timeout}ms).`)), this.timeout);
                }

                this.socket.write(Buffer.from(JSON.stringify(msg)).toString("base64") + ";");
            });
        };
    }
}
exports.SocketAdapter = SocketAdapter;
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

/** @typedef {import("child_process").ChildProcess} ChildProcess */

/** 
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.ICommunicationPipeline<TOutgoingData, TIncomingData>} ICommunicationPipeline 
 */

/** @typedef {Donuts.Remote.ICommunicationSource} ICommunicationSource */

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
const utils = require("donuts.node/utils");

/**
 * @class
 * @template TOutgoingData, TIncomingData
 * @implements {ICommunicationSource}
 */
class ProcessAdapter extends EventEmitter {
    /**
     * @private
     * @static
     * @param {*} channel 
     * @returns {channel is ChildProcess}
     */
    static isValidChannel(channel) {
        return !utils.isNullOrUndefined(channel)
            && utils.isFunction(channel.kill)
            && utils.isNumber(channel.pid)
            && utils.isFunction(channel.send)
            && utils.isFunction(channel.on)
            && utils.isFunction(channel.removeListener);
    }

    /**
     * @public
     * @param {ChildProcess} process
     * @param {number} [timeout]
     */
    constructor(process, timeout) {
        if (!ProcessAdapter.isValidChannel(process)) {
            throw new Error("process must be an instance of child_process.ChildProcess.");
        }

        super();

        /**
         * @private
         * @readonly
         * @type {ChildProcess}
         */
        this.process = process;

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
         * @readonly
         * @param {any} data
         */
        this.onMessage = (data) => {
            try {
                if (!utils.isString(data)) {
                    return;
                }

                /** @type {IMessage<any>} */
                const incomingMsg = JSON.parse(data);

                /** @type {IMsgPromiseRecord} */
                const msgPromiseRecord = this.msgDictionary[incomingMsg.id];

                if (!msgPromiseRecord) {
                    this.emit("message", this, incomingMsg);

                } else {
                    msgPromiseRecord.resolve(incomingMsg);
                }
            } catch (error) {
                Log.writeExceptionAsync(error);
                throw error;
            }
        };

        this.process.on("message", this.onMessage);

        /**
         * @public
         * @readonly
         * @param {ICommunicationPipeline<TOutgoingData, TIncomingData>} pipeline
         * @param {IMessage<TOutgoingData>} outgoingMsg
         * @returns {Promise<IMessage<TIncomingData>>}
         */
        this.handleoutgoingMail = async (pipeline, outgoingMsg) => {
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

                this.process.send(JSON.stringify(msg),
                    (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
            });
        };
    }
}
exports.ProcessAdapter = ProcessAdapter;
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { EventEmitter } = require("donuts.node/event-emitter");
const random = require("donuts.node/random");
const utils = require("donuts.node/utils");

/** @typedef {Donuts.Remote.ICommunicationSource} ICommunicationSource */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.ICommunicationPipeline<TOutgoingData, TIncomingData>} ICommunicationPipeline 
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
 * @implements {ICommunicationPipeline<TOutgoingData, TIncomingData>}
 */
class Postbox extends EventEmitter {
    /**
     * @public
     * @param {Donuts.Logging.ILog} log
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
         * @type {TOutgoingData}
         */
        this.outgoingDataTemplate = undefined;

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
         * @type {string}
         */
        this.moduleName = moduleName || "REMOTE";

        /**
         * @protected 
         * @readonly
         * @type {Donuts.Logging.ILog}
         */
        this.log = log;

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
        if (this.outgoingPipe.length > 0) {
            this.outgoingPipe.splice(0);
        }

        if (this.incomingPipe.length > 0) {
            this.incomingPipe.splice(0);
        }

        this.disposed = true;
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
            this.logMessage(outgoingMsg, "No outgoing handler or target handler handles the message.", "error");
            throw new Error("No outgoing handler or target handler handles the message.");
        }

        this.logMessage(incomingMsg);

        incomingMsg = await this.PipeToIncomingPipeAsync(outgoingMsg, incomingMsg);

        this.logMessage(incomingMsg, "Incoming message processing completed.");

        return incomingMsg.data;
    }

    /**
     * @protected
     * @virtual
     * @param {IMessage<TIncomingData>} incomingMsg
     * @returns {Promise<void>}
     */
    async emitincomingMailAsync(incomingMsg) {
        this.logMessage(incomingMsg);

        for (const asyncHandler of this.incomingPipe) {
            try {
                incomingMsg = await asyncHandler(this, undefined, incomingMsg);

            } catch (err) {
                this.logMessage(incomingMsg, err && utils.isFunction(err.toString) ? err.toString() : JSON.stringify(err), "error");
                throw err;
            }
        }

        this.logMessage(incomingMsg, "Incoming message processing completed.");

        this.emit("data", this, incomingMsg.data);
    }

    /**
     * @protected
     * @virtual
     * @param {IMessage<TOutgoingData>} outgoingMsg
     * @return {Promise<IMessage<TIncomingData>>}
     */
    async PipeToOutgoingPipeAsync(outgoingMsg) {
        /** @type {IMessage<TIncomingData>} */
        let incomingMsg = undefined;

        for (const asyncHandler of this.outgoingPipe) {
            try {
                incomingMsg = await asyncHandler(this, outgoingMsg);

            } catch (err) {
                this.logMessage(outgoingMsg, err && utils.isFunction(err.toString) ? err.toString() : JSON.stringify(err), "error");
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
     * @param {IMessage<TOutgoingData>} outgoingMsg
     * @param {IMessage<TIncomingData>} incomingMsg
     * @return {Promise<IMessage<TIncomingData>>}
     */
    async PipeToIncomingPipeAsync(outgoingMsg, incomingMsg) {
        for (const asyncHandler of this.incomingPipe) {
            try {
                incomingMsg = await asyncHandler(this, outgoingMsg, incomingMsg);

            } catch (err) {
                this.logMessage(incomingMsg, err && utils.isFunction(err.toString) ? err.toString() : JSON.stringify(err), "error");
                throw err;
            }
        }

        return incomingMsg;
    }

    /**
     * @protected
     * @virtual
     * @param {TOutgoingData} outgoingData 
     * @returns {IMessage<TOutgoingData>}
     */
    generateoutgoingMail(outgoingData) {
        /** @type {IMessage<TOutgoingData>} */
        const outgoingMsg = Object.create(null);

        outgoingMsg.data = Object.assign(Object.assign(Object.create(null), this.outgoingDataTemplate), outgoingData);
        outgoingMsg.id = random.generateUid();
        outgoingMsg.source = this.id;
        outgoingMsg.operationId = random.generateUid();
        outgoingMsg.timestamp = Date.now();

        return outgoingMsg;
    }

    /**
     * @protected
     * @virtual
     * @param {IMessage<TOutgoingData | TIncomingData>} message
     * @param {string} [text]
     * @param {Donuts.Logging.Severity} [severity]
     * @returns {void}
     */
    logMessage(message, text, severity) {
        if (!this.log) {
            return;
        }

        severity = severity || "info";

        /** @type {string} */
        let msg = "";

        if (message.id) {
            msg += " " + message.id;
        }

        if (typeof message.timestamp === "number") {
            msg += utils.string.format(" ~{,4:F0}", Date.now() - message.timestamp);
        }

        if (message.source && message.source !== this.id) {
            msg += " <= " + message.source;
        }

        if (message.target && message.target !== this.id) {
            msg += " => " + message.target;
        }

        if (text) {
            msg += ": " + text;
        }

        this.log.writeAsync(
            severity,
            "<{}>{,8} {}{,8}{}{}", // Format: <{Id}>{ModuleName} {OperationName}{OperationId?}{Msg?}
            this.id,
            this.moduleName,
            message.operationId ? `<${message.operationId}>` : "",
            message.operationName || "",
            message.operationDescription ? " " + message.operationDescription : "",
            msg);
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
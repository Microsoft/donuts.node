//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const { EventEmitter } = require("donuts.node/event-emitter");
const random = require("donuts.node/random");
const utils =  require("donuts.node/utils");

/**
 * @template TOutMsg, TInMsg
 * @implements {Donuts.Remote.ICommunicationPipeline<TOutMsg, TInMsg>}
 */
class CommunicationPipeline extends EventEmitter {
    /**
     * @public
     * @param {Donuts.Logging.ILog} log
     */
    constructor(log) {
        super();

        /**
         * @private 
         * @readonly
         * @type {Donuts.Logging.ILog}
         */
        this.log = log;

        /**
         * @public
         * @readonly
         * @type {string}
         */
        this.id = "";

        /**
         * @protected
         * @type {string}
         */
        this.moduleName = "REMOTE";

        /**
         * @public
         * @type {TOutMsg}
         */
        this.outgoingMsgTemplate = undefined;

        /**
         * @public
         * @readonly
         * @type {Array<Donuts.Remote.OutgoingAsyncHandler<TOutMsg, TInMsg>>}
         */
        this.outgoingPipe = [];

        /**
         * @public
         * @readonly
         * @type {Array<Donuts.Remote.OutgoingAsyncHandler<TOutMsg, TInMsg>>}
         */
        this.incomingPipe = [];
    }

    /**
     * @public
     * @param {TOutMsg} msg 
     * @returns {Promise<TInMsg>}
     */
    sendAsync(msg) {
        const requestId = random.generateUid(8);
        const 

        msg = this.mergeOutgoingMsg(this.outgoingMsgTemplate, msg);
        this.logInfo(`${this.id} HTTP ${request.method.padStart(4, " ")} ${requestId} => ${request.url}`);
    }

    /**
     * @protected
     * @param {TOutMsg} baseMsg
     * @param {TOutMsg} childMsg
     * @returns {TOutMsg}
     */
    mergeOutgoingMsg(baseMsg, childMsg) {
        return Object.assign(Object.assign(Object.create(null), baseMsg), childMsg);
    }

    /**
     * @param {string} operationName
     * @param {string} operationId
     * @param {string} msgId
     * @param {string} target
     * @param {number} durationInMS duration in millisenconds.
     * @returns {void}
     */
    logOperation(operationName, operationId, msgId, target, durationInMS) {
        /** @type {string} */
        let msg = "";

        if (msgId) {
            msg += " " + msgId;
        }

        if (durationInMS) {
            msg += utils.string.format(" ~{,4:F0}", durationInMS);
        }

        if (target) {
            msg += " => " + target;
        }

        this.logInfo("<{}>{,8} {,8}<{}>{}", this.id, this.moduleName, operationName, operationId, msg);
    }

    /**
     * @private
     * @param {string} messageOrFormat
     * @param {...any} params
     * @returns {void}
     */
    logInfo(messageOrFormat, ...params) {
        if (!this.log) {
            return;
        }

        this.log.writeInfoAsync(messageOrFormat, ...params);
    }

    /**
     * @private
     * @param {string} messageOrFormat
     * @param {...any} params
     * @returns {void}
     */
    logError(messageOrFormat, ...params) {
        if (!this.log) {
            return;
        }

        this.log.writeErrorAsync(messageOrFormat, ...params);
    }
}
exports.CommunicationPipeline = CommunicationPipeline;
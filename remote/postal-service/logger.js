//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail 
 */

/**
 * @typedef {Donuts.Remote.PostalService.IPostalError} PostalError
 */

const utils = require("donuts.node/utils");

class Logger {

    /**
     * 
     * @param {Donuts.Logging.ILog} log 
     * @param {string} componentId
     */
    constructor(log, componentId) {
        if (!log) {
            throw new Error("log must be provided");
        }

        if (!utils.isString(componentId)) {
            throw new Error("componentId must be provided.");
        }

        /**
         * @public 
         * @readonly
         * @type {Donuts.Logging.ILog}
         */
        this.log = log;

        /**
         * @public
         * @readonly
         * @type {string}
         */
        this.componentId = componentId;

        /**
         * @public
         * @readonly
         * @type {string}
         */
        this.moduleName = "postal";
    }

    /**
     * 
     * @param {IMail<any>} mail
     * @param {string} [message]
     * @param {Donuts.Logging.Severity} [severity] 
     * @returns {void}
     */
    logMail(mail, message, severity) {
        severity = severity || "info";

        /** @type {string} */
        let msg = "";

        if (mail.id) {
            msg += " " + mail.id;
        }

        if (typeof mail.timestamp === "number") {
            msg += utils.string.format(" ~{,4:F0}", Date.now() - mail.timestamp);
        }

        msg += utils.string.format(
            " {} => {}",
            mail.from ? mail.from.href : "",
            mail.to ? mail.to.href : "");

        if (message) {
            msg += ": " + message;
        }

        // msg format: [{timestamp}] {~processingDuration} {mailId}

        this.log.writeAsync(
            severity,
            "<{}>{,8} {,8}{}", // Format: <{Id}>{ModuleName} {Type}{Msg?}
            this.componentId,
            this.moduleName,
            mail.type,
            msg);
    }

    /**
     * 
     * @param {IMail<any>} mail
     * @param {PostalError} error
     * @param {string} [message]
     * @returns {void}
     */
    logMailError(mail, error, message) {
        
    }

    /**
     * 
     * @param {string} message 
     */
    logVerbose(message) {
    }

    /**
     * 
     * @param {string} message 
     */
    logInfo(message) {
    }

    /**
     * 
     * @param {string} message 
     * @param {PostalError} [error] 
     */
    logWarning(message, error) {

    }

    /**
     * 
     * @param {string} message 
     * @param {PostalError} [error] 
     */
    logError(message, error) {

    }

    /**
     * 
     * @param {string} message 
     * @param {PostalError} [error] 
     */
    logCritical(message, error) {
    }
}
exports.Logger = Logger;
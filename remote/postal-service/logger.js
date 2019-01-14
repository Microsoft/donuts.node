//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const utils = require("donuts.node/utils");

class Logger {

    /**
     * 
     * @param {Donuts.Logging.ILog} log 
     * @param {string} componentId
     * @param {string} moduleName
     */
    constructor(log, componentId, moduleName) {
        if (!log) {
            throw new Error("log must be provided");
        }

        if (!utils.isString(componentId)) {
            throw new Error("componentId must be provided.");
        }

        if (!utils.isString(moduleName)) {
            throw new Error("moduleName must be provided.");
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
        this.moduleName = moduleName;
    }

    /**
     * 
     * @param {Donuts.Logging.Severity} severity 
     * @param {Donuts.Remote.PostalService.IMail<any>} mail 
     * @param {string} [message] 
     * @returns {void}
     */
    logMail(severity, mail, message) {
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
}
exports.Logger = Logger;
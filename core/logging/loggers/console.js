//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const path = require("path");
const utils = require("../../utils");

/**
 * @typedef {Logging.ILoggerSettings} IConsoleLoggerSettings
 * @property {boolean} [logAllProperties]
 * @property {boolean} [logCallerInfo]
 */

/**
 * @class
 * @implements {Logging.ILogger}
 */
class ConsoleLogger {
    /**
     * 
     * @param {IConsoleLoggerSettings} [settings]
     * @param {Console} [targetConsole]
     */
    constructor(settings, targetConsole) {

        /**
         * @type {Console}
         */
        this.console = console;

        if (!utils.isObject(settings)) {
            settings = {
                name: "console",
                component: "logging.logger.console"
            };
        }

        /**
        * @readonly
        * @type {IConsoleLoggerSettings}
        */
        this.settings = settings;
        this.settings.logAllProperties = utils.pick(settings.logAllProperties, true);
        this.settings.logCallerInfo = utils.pick(settings.logCallerInfo, true);

        /** 
         * @readonly
         * @type {string} 
         */
        this.name = this.settings.name;

        if (!utils.isNullOrUndefined(targetConsole)) {
            this.console = targetConsole;
        }
    }

    /**
     * 
     * @param {IDictionary.<string>} properties 
     * @param {Logging.Severity} severity 
     * @param {string} message 
     * @returns {Promise<void>}
     */
    async writeAsync(properties, severity, message) {
        /** @type {string} */
        const consoleMsg = this.formatConsoleMsg(properties, message);

        switch (severity) {
            case "critical":
                this.console.error(consoleMsg);
                this.console.trace();
                break;

            case "error":
                this.console.error(consoleMsg);
                break;

            case "warning":
                this.console.warn(consoleMsg);
                break;

            case "event":
            case "info":
                this.console.info(consoleMsg);
                break;

            case "verbose":
            default:
                this.console.log(consoleMsg);
                break;
        }
    }

    /**
     * 
     * @param {IDictionary.<string>} properties 
     * @param {Error} error 
     * @returns {Promise<void>}
     */
    async writeExceptionAsync(properties, error) {
        /** @type {string} */
        let exceptionMsg = "";

        exceptionMsg += error.name + ": " + error.message;
        exceptionMsg += "\r\n";
        exceptionMsg += error.stack;

        this.console.error(this.formatConsoleMsg(properties, exceptionMsg));
    }

    /**
     * 
     * @param {IDictionary.<string>} properties 
     * @param {string} name 
     * @param {number} value 
     * @returns {Promise<void>}
     */
    async writeMetricAsync(properties, name, value) {
        this.console.info(this.formatConsoleMsg(properties, name + ": " + value.toString()));
    }

    /**
     * 
     * @param {IDictionary.<string>} properties 
     * @returns {string}
     */
    formatProperties(properties) {
        /** @type {string} */
        let consoleMsg = "";

        if (!utils.isNullOrUndefined(properties)) {

            if (this.settings.logAllProperties) {
                for (const propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName) && !propertyName.startsWith("Caller.")) {
                        consoleMsg += `<${propertyName}:${properties[propertyName]}>`;
                    }
                }
            }

            if (this.settings.logCallerInfo
                && (!utils.string.isEmptyOrWhitespace(properties["Caller.FileName"])
                    || !utils.string.isEmptyOrWhitespace(properties["Caller.Name"]))) {
                consoleMsg += `[${path.basename(properties["Caller.FileName"])}:${properties["Caller.Name"]}]`;
            }
        }

        return consoleMsg;
    }

    /**
     * 
     * @param {IDictionary.<string>} properties 
     * @param {string} message 
     * @returns {string}
     */
    formatConsoleMsg(properties, message) {
        /** @type {string} */
        let consoleMsg = "[" + new Date().toLocaleTimeString() + "]";

        const formatedProperties = this.formatProperties(properties);

        if (!utils.string.isEmptyOrWhitespace(formatedProperties)) {
            consoleMsg += " ";
            consoleMsg += formatedProperties;
        }

        consoleMsg += " ";
        consoleMsg += message;

        return consoleMsg;
    }
}
exports.ConsoleLogger = ConsoleLogger;

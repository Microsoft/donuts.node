//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const path = require("path");
const utils = require("../utils");
const { ConsoleLogger } = require("./loggers/console");

/**
 * @class
 * @implements {Donuts.Logging.ILog}
 */
class Log {
    /**
     * @public
     * @returns {Donuts.Logging.ILog}
     */
    static get instance() {
        if (!Log._instance) {
            Log._instance = new Log();
        }

        return Log._instance;
    }

    /**
     * @private
     * @param {Error} error 
     * @param {Array.<NodeJS.CallSite>} structuredStackTrace 
     * @returns {*}
     */
    static prepareStackTraceOverride(error, structuredStackTrace) {
        return structuredStackTrace;
    }

    /**
     * @private
     * @returns {import("../utils").CallerInfo}
     */
    static getCallerModuleInfo() {
        const previousPrepareStackTraceFn = Error.prepareStackTrace;

        try {
            Error.prepareStackTrace = Log.prepareStackTraceOverride;

            /** @type {Array.<NodeJS.CallSite>} */
            // @ts-ignore
            const callStack = (new Error()).stack;

            for (let callStackIndex = 0; callStackIndex < callStack.length; callStackIndex++) {
                const stack = callStack[callStackIndex];
                const stackFileName = stack.getFileName();

                if (!stackFileName.startsWith(path.dirname(module.filename))) {
                    return {
                        fileName: stackFileName,
                        functionName: stack.getFunctionName(),
                        typeName: stack.getTypeName(),
                        lineNumber: stack.getLineNumber(),
                        columnNumber: stack.getColumnNumber()
                    };
                }
            }

            return undefined;
        } finally {
            Error.prepareStackTrace = previousPrepareStackTraceFn;
        }
    }

    /**
     * @private
     * @param {*} obj 
     * @returns {string}
     */
    static stringifier(obj) {
        if (obj instanceof Error) {
            const errorObj = Object.create(null);

            errorObj.message = obj.message;
            errorObj.name = obj.name;

            if ("stack" in obj) {
                errorObj.stack = obj.stack;
            }

            if ("code" in obj) {
                errorObj.code = obj["code"];
            }

            obj = errorObj;
        }

        return utils.string.stringifier(obj);
    }

    /**
     * @public
     * @param {boolean} [includeCallerInfo]
     * @param {Object.<string, *>} [defaultProperties]
     */
    constructor(includeCallerInfo, defaultProperties) {
        /** @type {Object.<string, *>} */
        this.defaultProperties = undefined;

        /** @type {boolean} */
        this.loggCallerInfo = false;

        if (!utils.isNullOrUndefined(defaultProperties)
            && !utils.isObject(defaultProperties)) {
            throw new Error("defaultProperties must be an object.");
        }
        /** @type {Object.<string, Donuts.Logging.ILogger>} */
        this.loggers = Object.create(null);
        this.defaultProperties = defaultProperties;
        this.logCallerInfo = includeCallerInfo === true;
    }

    /**
     * @public
     * @param {Object.<string, string>} properties 
     * @param {Donuts.Logging.Severity} severity 
     * @param {string} messageOrFormat 
     * @param {...*} params 
     * @returns {Promise<this>}
     */
    async writeMoreAsync(properties, severity, messageOrFormat, ...params) {
        if (!utils.isString(messageOrFormat)) {
            return;
        }

        if (Array.isArray(params) && params.length > 0) {
            messageOrFormat = utils.string.formatEx(Log.stringifier, messageOrFormat, ...params);
        }

        properties = this.generateProperties(properties);

        await Promise.all(Object.values(this.loggers).map((logger) => logger.writeAsync(properties, severity, messageOrFormat)));
        return this;
    }

    /**
     * @public
     * @param {Donuts.Logging.Severity} severity 
     * @param {string} messageOrFormat 
     * @param {...*} params 
     * @returns {Promise<this>}
     */
    writeAsync(severity, messageOrFormat, ...params) {
        return this.writeMoreAsync(null, severity, messageOrFormat, ...params);
    }

    /**
     * @public
     * @param {string} messageOrFormat 
     * @param {...*} params 
     * @returns {Promise.<this>}
     */
    writeInfoAsync(messageOrFormat, ...params) {
        return this.writeAsync("info", messageOrFormat, ...params);
    }

    /**
     * @public
     * @param {string} messageOrFormat 
     * @param {...*} params 
     * @returns {Promise.<this>}
     */
    writeVerboseAsync(messageOrFormat, ...params) {
        return this.writeAsync("verbose", messageOrFormat, ...params);
    }

    /**
     * @public
     * @param {string} messageOrFormat 
     * @param {...*} params 
     * @returns {Promise.<this>}
     */
    writeWarningAsync(messageOrFormat, ...params) {
        return this.writeAsync("warning", messageOrFormat, ...params);
    }

    /**
     * @public
     * @param {string} messageOrFormat 
     * @param {...*} params 
     * @returns {Promise<this>}
     */
    writeErrorAsync(messageOrFormat, ...params) {
        return this.writeAsync("error", messageOrFormat, ...params);
    }

    /**
     * @public
     * @param {string} messageOrFormat 
     * @param {...*} params 
     * @returns {Promise<this>}
     */
    writeCriticalAsync(messageOrFormat, ...params) {
        return this.writeAsync("critical", messageOrFormat, ...params);
    }

    /**
     * @public
     * @param {Error} exception 
     * @param {Object.<string, string>} [properties]
     * @returns {Promise.<this>}
     */
    async writeExceptionAsync(exception, properties) {
        properties = this.generateProperties(properties);

        await Promise.all(Object.values(this.loggers).map((logger) => logger.writeExceptionAsync(properties, exception)));
        return this;
    }

    /**
     * @public
     * @param {string} name 
     * @param {Object.<string, string>} [properties]
     * @returns {Promise.<this>}
     */
    async writeEventAsync(name, properties) {
        if (!utils.isString(name)) {
            return;
        }

        properties = this.generateProperties(properties);

        await Promise.all(Object.values(this.loggers).map((logger) => logger.writeAsync(properties, "event", name)));

        return this;
    }

    /**
     * @public
     * @param {string} name 
     * @param {number} [value]
     * @param {Object.<string, string>} [properties]
     * @returns {Promise.<this>}
     */
    async writeMetricAsync(name, value, properties) {
        if (!utils.isString(name)) {
            return;
        }

        if (!utils.isNumber(value)) {
            value = 1;
        }

        properties = this.generateProperties(properties);

        await Promise.all(Object.values(this.loggers).map((logger) => logger.writeMetricAsync(properties, name, value)));
        
        return this;
    }

    /**
     * @public
     * @param {string} name 
     * @returns {Promise.<this>}
     */
    async removeLoggerAsync(name) {
        if (!utils.isString(name)) {
            throw new Error("name must be supplied.");
        }

        delete this.loggers[name];

        return this;
    }

    /**
     * @public
     * @param {string} name
     * @param {Donuts.Logging.ILogger} logger 
     * @returns {Promise.<this>}
     */
    async addLoggerAsync(name, logger) {
        if (!utils.isString(name)) {
            throw new Error("name must be a string.");
        }

        if (!logger) {
            throw new Error("logger must be provided.");
        }

        if (!utils.isObject(logger)) {
            throw new Error("logger must be an object implementing ILogger.");
        }

        this.loggers[name] = logger;
        
        return this;
    }

    /**
     * @public
     * @param {string} name 
     * @return {Promise<Donuts.Logging.ILogger>}
     */
    async getLoggerAsync(name) {
        if (!utils.isString(name)) {
            throw new Error("name must be a string.");
        }

        return this.loggers[name];
    }

    /**
     * @private
     * @param {Object.<string, string>} properties 
     * @returns {Object.<string, string>}
     */
    generateProperties(properties) {
        /** @type {Object.<string, string>} */
        let finalProperties = null;

        if (this.defaultProperties) {
            finalProperties = Object.create(this.defaultProperties);
        }

        if (utils.isObject(properties)) {
            finalProperties = finalProperties || Object.create(null);
            finalProperties = Object.assign(finalProperties, properties);
        }

        if (this.logCallerInfo) {
            const callerInfo = Log.getCallerModuleInfo();

            if (callerInfo) {
                const typeName = callerInfo.typeName || "";
                let functionName = callerInfo.functionName;

                if (!functionName) {
                    functionName = `<Anonymous>@{${callerInfo.lineNumber},${callerInfo.columnNumber}}`;
                }

                finalProperties = finalProperties || Object.create(null);
                finalProperties["Caller.FileName"] = callerInfo.fileName;

                if (!utils.string.isEmptyOrWhitespace(typeName)) {
                    finalProperties["Caller.Name"] = `${typeName}.`;
                } else {
                    finalProperties["Caller.Name"] = "";
                }

                finalProperties["Caller.Name"] += `${functionName}()`;
            }
        }

        return finalProperties;
    }
}
exports.Log = Log;

/** @type {Donuts.Logging.ILog} */
Log._instance = undefined;
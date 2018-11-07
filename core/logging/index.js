//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { Log } = require("./log");

/** @type {Donuts.Logging.ILog} */
let defaultLog;

/**
 * Get the default log object.
 * @returns {Donuts.Logging.ILog} The default ILog object.
 */
exports.getLog = () => {
    if (!defaultLog) {
        defaultLog = Log.instance;
    }

    return defaultLog;
}

/**
 * Set the default log object.
 * @param {Donuts.Logging.ILog} log The new default ILog object.
 */
exports.setLog = (log) => defaultLog = log;

/**
 * 
 * @param {Object.<string, string>} properties 
 * @param {Donuts.Logging.Severity} severity 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise<Donuts.Logging.ILog>}
 */
exports.writeMoreAsync = (properties, severity, messageOrFormat, ...params) =>
    defaultLog.writeMoreAsync(properties, severity, messageOrFormat, ...params);

/**
 * 
 * @param {Donuts.Logging.Severity} severity 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise<Donuts.Logging.ILog>}
 */
exports.writeAsync = (severity, messageOrFormat, ...params) => defaultLog.writeAsync(severity, messageOrFormat, ...params);

/**
 * 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise.<Donuts.Logging.ILog>}
 */
exports.writeInfoAsync = (messageOrFormat, ...params) => defaultLog.writeInfoAsync(messageOrFormat, ...params);

/**
 * 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise.<Donuts.Logging.ILog>}
 */
exports.writeVerboseAsync = (messageOrFormat, ...params) => defaultLog.writeVerboseAsync(messageOrFormat, ...params);

/**
 * 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise.<Donuts.Logging.ILog>}
 */
exports.writeWarningAsync = (messageOrFormat, ...params) => defaultLog.writeWarningAsync(messageOrFormat, ...params);

/**
 * 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise<Donuts.Logging.ILog>}
 */
exports.writeErrorAsync = (messageOrFormat, ...params) => defaultLog.writeErrorAsync(messageOrFormat, ...params);

/**
 * 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise<Donuts.Logging.ILog>}
 */
exports.writeCriticalAsync = (messageOrFormat, ...params) => defaultLog.writeCriticalAsync(messageOrFormat, ...params);

/**
 * 
 * @param {Error} exception 
 * @param {Object.<string, string>} [properties]
 * @returns {Promise.<Donuts.Logging.ILog>}
 */
exports.writeExceptionAsync = (exception, properties) => defaultLog.writeExceptionAsync(exception, properties);

/**
 * 
 * @param {string} name 
 * @param {Object.<string, string>} [properties]
 * @returns {Promise.<Donuts.Logging.ILog>}
 */
exports.writeEventAsync = (name, properties) => defaultLog.writeEventAsync(name, properties);

/**
 * 
 * @param {string} name 
 * @param {number} [value]
 * @param {Object.<string, string>} [properties]
 * @returns {Promise.<Donuts.Logging.ILog>}
 */
exports.writeMetricAsync = (name, value, properties) => defaultLog.writeMetricAsync(name, value, properties);

/**
 * 
 * @param {string} name 
 * @returns {Promise.<Donuts.Logging.ILog>}
 */
exports.removeLoggerAsync = (name) => defaultLog.removeLoggerAsync(name);

/**
 * 
 * @param {string} name 
 * @returns {Promise.<Donuts.Logging.ILogger>}
 */
exports.getLoggerAsync = (name) => defaultLog.getLoggerAsync(name);

/**
 * @param {string} name
 * @param {Donuts.Logging.ILogger} logger 
 * @returns {Promise.<Donuts.Logging.ILog>}
 */
exports.addLoggerAsync = (name, logger) => defaultLog.addLoggerAsync(name, logger);

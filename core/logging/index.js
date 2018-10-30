//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { Log } = require("./log");

/** @type {Logging.ILog} */
let defaultLog;

/**
 * Get the default log object.
 * @returns {Logging.ILog} The default ILog object.
 */
exports.getLog = () => {
    if (!defaultLog) {
        defaultLog = Log.instance;
    }

    return defaultLog;
}

/**
 * Set the default log object.
 * @param {Logging.ILog} log The new default ILog object.
 */
exports.setLog = (log) => defaultLog = log;

/**
 * 
 * @param {IDictionary<string>} properties 
 * @param {Logging.Severity} severity 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise<void>}
 */
exports.writeMoreAsync = (properties, severity, messageOrFormat, ...params) =>
    defaultLog.writeMoreAsync(properties, severity, messageOrFormat, ...params);

/**
 * 
 * @param {Logging.Severity} severity 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise<void>}
 */
exports.writeAsync = (severity, messageOrFormat, ...params) => defaultLog.writeAsync(severity, messageOrFormat, ...params);

/**
 * 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise.<void>}
 */
exports.writeInfoAsync = (messageOrFormat, ...params) => defaultLog.writeInfoAsync(messageOrFormat, ...params);

/**
 * 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise.<void>}
 */
exports.writeVerboseAsync = (messageOrFormat, ...params) => defaultLog.writeVerboseAsync(messageOrFormat, ...params);

/**
 * 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise.<void>}
 */
exports.writeWarningAsync = (messageOrFormat, ...params) => defaultLog.writeWarningAsync(messageOrFormat, ...params);

/**
 * 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise<void>}
 */
exports.writeErrorAsync = (messageOrFormat, ...params) => defaultLog.writeErrorAsync(messageOrFormat, ...params);

/**
 * 
 * @param {string} messageOrFormat 
 * @param {...*} params 
 * @returns {Promise<void>}
 */
exports.writeCriticalAsync = (messageOrFormat, ...params) => defaultLog.writeCriticalAsync(messageOrFormat, ...params);

/**
 * 
 * @param {Error} exception 
 * @param {IDictionary.<string>} [properties]
 * @returns {Promise.<void>}
 */
exports.writeExceptionAsync = (exception, properties) => defaultLog.writeExceptionAsync(exception, properties);

/**
 * 
 * @param {string} name 
 * @param {IDictionary.<string>} [properties]
 * @returns {Promise.<void>}
 */
exports.writeEventAsync = (name, properties) => defaultLog.writeEventAsync(name, properties);

/**
 * 
 * @param {string} name 
 * @param {number} [value]
 * @param {IDictionary.<string>} [properties]
 * @returns {Promise.<void>}
 */
exports.writeMetricAsync = (name, value, properties) => defaultLog.writeMetricAsync(name, value, properties);

/**
 * 
 * @param {string} name 
 * @returns {Promise.<Logging.ILogger>}
 */
exports.removeLoggerAsync = (name) => defaultLog.removeLoggerAsync(name);

/**
 * 
 * @param {Logging.ILogger} logger 
 * @returns {Promise.<void>}
 */
exports.addLoggerAsync = (logger) => defaultLog.addLoggerAsync(logger);

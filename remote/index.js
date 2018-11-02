//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const utils = require("donuts.node/utils");
const { EventEmitter } = require("events");
const { Communicator } = require("./communicator");

exports.Communicator = Communicator;
exports.CommunicationHost = require("./communication-host").CommunicationHost;
exports.ObjectRemotingProxy = require("./object-remoting-proxy").ObjectRemotingProxy;

exports.Proxy = {
    ChannelHostProxy: require("./proxy/channel-host-proxy").ChannelHostProxy,
    ChannelProxy: require("./proxy/channel-proxy").ChannelProxy,

    ProcessProxy: require("./proxy/process-proxy").ProcessProxy,
    SocketHostProxy: require("./proxy/socket-host-proxy").SocketHostProxy,
    SocketProxy: require("./proxy/socket-proxy").SocketProxy
};

exports.Pattern = {
    Regex: require("./pattern/regex").Regex,
    String: require("./pattern/string").String
};

/**
 * Check if the given object is a ChannelProxy (IChannelProxy).
 * @param {*} value The object to check.
 * @returns {value is Donuts.Remote.IChannelProxy} True if the object is a ChannelProxy or ChannelProxy-alike. Otherwise, false.
 */
exports.isChannelProxy =
    (value) =>
        !utils.isNullOrUndefined(value)
        && utils.isFunction(value.setHandler)
        && utils.isFunction(value.sendData);

/**
 * Check if the given object is a ChannelHostProxy (IChannelHostProxy).
 * @param {*} value The object to check.
 * @returns {value is Donuts.Remote.IChannelHostProxy} True if the object is a ChannelHostProxy or ChannelHostProxy-alike. Otherwise, false.
 */
exports.isChannelHostProxy =
    (value) =>
        !utils.isNullOrUndefined(value)
        && utils.isFunction(value.setHandler)
        && exports.isConnectionInfo(value.connectionInfo);

/**
 * Check if the given object is a Communicator (ICommunicator).
 * @param {any} communicator The object to check.
 * @returns {communicator is Donuts.Remote.ICommunicator} True if the object is a Communicator or Communicator-alike. Otherwise, false.
 */
exports.isCommunicator =
    (communicator) =>
        !utils.isNullOrUndefined(communicator)
        && utils.isString(communicator.id)
        && utils.isFunction(communicator.map)
        && utils.isFunction(communicator.unmap)
        && utils.isFunction(communicator.sendAsync);

/**
 * Check if the given object is a CommunicationHost (ICommunicationHost).
 * @param {*} value The object to check.
 * @returns {value is Donuts.Remote.ICommunicationHost} True if the object is a CommunicationHost or CommunicationHost-alike. Otherwise, false.
 */
exports.isCommunicationHost =
    (value) =>
        !utils.isNullOrUndefined(value)
        && utils.isObject(value.communicators)
        && exports.isConnectionInfo(value.connectionInfo)
        && utils.isFunction(value.map)
        && utils.isFunction(value.unmap)
        && value instanceof EventEmitter;

/**
 * Check if the given object is a RoutePattern (IRoutePattern).
 * @param {*} pattern The object to check.
 * @returns {pattern is Donuts.Remote.IRoutePattern} True if the object is a communicator or communicator-alike. Otherwise, false.
 */
exports.isRoutePattern =
    (pattern) =>
        !utils.isNullOrUndefined(pattern)
        && utils.isFunction(pattern.equals)
        && utils.isFunction(pattern.getRaw)
        && utils.isFunction(pattern.match);

/**
 * Check if the given object is a IConnectionInfo.
 * @param {*} value
 * @returns {value is Donuts.Remote.IConnectionInfo} 
 */
exports.isConnectionInfo =
    (value) =>
        !utils.isNullOrUndefined(value)
        && utils.isString(value.moduleName)
        && utils.isString(value.initFunction);

/**
 * Connect to the target remote with the connection info.
 * @param {Donuts.Remote.IConnectionInfo} connectionInfo The connection info of the remote.
 * @returns {Donuts.Remote.ICommunicator} The instance of the communicator which connects to the remote.
 */
exports.connect = (connectionInfo) => {
    if (!exports.isConnectionInfo(connectionInfo)) {
        throw new Error("Invalid connectionInfo provided.");
    }

    /** @type {*} */
    let obj = require(connectionInfo.moduleName);

    for (const memberName of connectionInfo.initFunction.split(".")) {
        obj = obj[memberName];
    }

    /** @type {(connectionInfo: Donuts.Remote.IConnectionInfo) => Donuts.Remote.IChannelProxy} */
    const init = obj;

    if (!utils.isFunction(init)) {
        throw new Error(`Cannot find the init function: ${connectionInfo.initFunction}`);
    }

    return new Communicator(init(connectionInfo), connectionInfo.communicatorOptions);
}
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { ModuleManager } = require("./module-manager");

/** @type {WeakMap<Donuts.Modularity.IModuleManager, Donuts.Remote.IConnectionInfo>} */
const ConnectionInfoMap = new WeakMap();

/**
 * @param {Donuts.Remote.IConnectionInfo | Donuts.Remote.ICommunicationHost} options
 * @returns {Donuts.Modularity.IModuleManager}
 */
exports.createModuleManager = (options) => {
    const { isConnectionInfo, isCommunicationHost, connect } = require("donuts.node-remote");

    /** @type {Donuts.Modularity.IModuleManager} */
    let moduleManager;

    if (isConnectionInfo(options)) {
        moduleManager = new ModuleManager(connect(options));
        ConnectionInfoMap.set(moduleManager, options);

    } else if (isCommunicationHost(options)) {
        moduleManager = new ModuleManager(options);
        ConnectionInfoMap.set(moduleManager, options.connectionInfo);

    } else {
        throw new Error("given options must be either Donuts.Remote.IConnectionInfo or Donuts.Remote.ICommunicationHost");
    }

    return moduleManager;
}

exports.CmdArgs = {
    ConnectionInfo: "connection-info",
    ModulePath: "module-path"
};

/**
 * @param {Donuts.Modularity.IModuleManager} moduleManager
 * @return {Donuts.Remote.IConnectionInfo}
 */
exports.getConnectionInfo = (moduleManager) => {
    if (!moduleManager) {
        throw new Error("moduleManager must be supplied.");
    }

    return ConnectionInfoMap.get(moduleManager);
};

/**
 * @param {Donuts.Modularity.IModuleManager} moduleManager
 * @param {string} modulePath
 * @returns {import("child_process").ChildProcess}
 */
exports.fork = (moduleManager, modulePath) => {
    if (!moduleManager) {
        throw new Error("moduleManager must be supplied.");
    }

    const { isString } = require("donuts.node/utils");
    const { existsSync } = require("fs");

    if (!isString(modulePath)) {
        throw new Error("modulePath must be a string.");
    }

    if (!existsSync(modulePath)) {
        throw new Error("modulePath must point to an existing location.");
    }

    const connectionInfo = ConnectionInfoMap.get(moduleManager);

    if (!connectionInfo) {
        throw new Error("Failed to fork a new process as there is no connection info bound with the given module manager.");
    }

    const shell = require("donuts.node/shell");

    /** @type {Object.<string, string>} */
    const args = Object.create(null);

    args[exports.CmdArgs.ConnectionInfo] = JSON.stringify(connectionInfo);
    args[exports.CmdArgs.ModulePath] = modulePath;

    return shell.fork("./fork.js", shell.toCmdArgs(args));
}

/** @type {Donuts.Modularity.IModuleManager} */
let _defaultModuleManager;

/**
 * @returns {Donuts.Modularity.IModuleManager}
 */
exports.getModuleManager = () => {
    return _defaultModuleManager;
}

/**
 * @param {Donuts.Modularity.IModuleManager} moduleManager
 * @returns {void}
 */
exports.setModuleManager = (moduleManager) => {
    _defaultModuleManager = moduleManager;
}

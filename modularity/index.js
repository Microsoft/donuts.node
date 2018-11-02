//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

exports.ModuleManager = require("./module-manager").ModuleManager;

/**
 * @param {Donuts.Remote.IConnectionInfo} connectionInfo
 * @returns {Donuts.Modularity.IModuleManager}
 */
exports.createModuleManager = (connectionInfo) => {
    const { isConnectionInfo, connect } = require("donuts.node-remote");

    if (!isConnectionInfo(connectionInfo)) {
        throw new Error("connectionInfo must be a Donuts.Remote.IConnectionInfo.");
    }

    const commnicator = connect(connectionInfo);

    return new exports.ModuleManager(commnicator);
}

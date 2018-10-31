//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const ipc = require("donuts.node/ipc");

/** @type {string} */
const IpcPath = "donuts.node-remote/test";

/**
 * @param {string} [ipcPath]
 */
exports.createServer =
    (ipcPath) => ipc.host(ipcPath || IpcPath);

/**
 * @param {string} [ipcPath]
 */
exports.createClient =
    (ipcPath) => ipc.connect(ipcPath || IpcPath);
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const shell = require("donuts.node/shell");
const modularity = require(".");
const connectionInfo = JSON.parse(shell.getCmdArg(modularity.CmdArgs.ConnectionInfo));
const modulePath = shell.getCmdArg(modularity.CmdArgs.ModulePath);

modularity.setModuleManager(modularity.createModuleManager(connectionInfo));

// Load the main module.
require(modulePath);

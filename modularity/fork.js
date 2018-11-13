//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

// Bootstrap: initialize the default module manager.
require("./bootstrap");

const shell = require("donuts.node/shell");
const modularity = require(".");
const modulePath = shell.getCmdArg(modularity.CmdArgs.ModulePath);

// Load the main module.
require(modulePath);

//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const assert = require("assert");
const ipc = require("./ipc");
const { SocketHostProxy } = require("../../proxy/socket-host-proxy");

describe("SocketHostProxy", () => {
    const ipcPath = "SocketHostProxy";

    it(".constructor()", async () => {
        const proxy = new SocketHostProxy(ipc.createServer(ipcPath));
        
        assert.ok(proxy.connectionInfo);
        await proxy.disposeAsync();
    });
});
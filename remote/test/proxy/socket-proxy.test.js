//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const assert = require("assert");
const ipc = require("./ipc");
const { SocketProxy } = require("../../proxy/socket-proxy");

describe("SocketProxy", () => {
    const ipcPath = "SocketProxy";

    /** @type {Array.<import("net").Socket>} */
    const connections = [];

    // @ts-ignore
    const ipcSvr =
        ipc.createServer(ipcPath)
            .on("connection", (socket) => connections.push(socket));

    after(() => new Promise((resolve, reject) => {
        ipcSvr.close(() => resolve());

        for (const socket of connections) {
            socket.destroy();
        }
    }));

    describe("static", () => {
        it("isValidChannel(): return true if channel is valid net.Socket.", () => {
            const ipcClient = ipc.createClient(ipcPath);

            assert.ok(SocketProxy.isValidChannel(ipcClient));
            ipcClient.destroy();
        });

        it("isValidChannel(): return false if channel is not valid net.Socket.", () => {
            assert.ok(!SocketProxy.isValidChannel({}));
        });
    });

    describe("instances", () => {
        it(".constructor()", async () => {
            const ipcClient = ipc.createClient(ipcPath);
            const proxy = new SocketProxy(ipcClient);

            await proxy.disposeAsync();
        });

        it(".disposeAsync()", () => new Promise((resolve, reject) => {
            const ipcClient = ipc.createClient(ipcPath);

            ipcClient.on("close", () => resolve());

            const proxy = new SocketProxy(ipcClient);

            proxy.disposeAsync();
        }));

        it("send/receive data.", () => {
            return new Promise((resolve, reject) => {
                ipcSvr.on("connection",
                    (socket) =>
                        socket.on("data",
                            (data) => {
                                try {
                                    assert.equal(data.toString("utf8"), "{\"msg\":\"helloWorld!!\"}");
                                    socket.write("\"Received.\"");
                                } catch (err) {
                                    reject(err);
                                }
                            }));

                const ipcClient = ipc.createClient(ipcPath);
                const proxy = new SocketProxy(ipcClient);

                proxy.setHandler("data", async (channel, data) => {
                    assert.equal("Received.", data);
                    await proxy.disposeAsync();
                    resolve();
                });

                assert.equal(proxy.sendData({ msg: "helloWorld!!" }), true);
            });
        });
    });
});
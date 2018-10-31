//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const assert = require("assert");
const ipc = require("./ipc");
const { SocketProxy } = require("../../proxy/socket-proxy");

describe("SocketProxy", () => {
    // @ts-ignore
    const ipcSvr = ipc.createServer();

    describe("static", () => {
        it("isValidChannel(): return true if channel is valid net.Socket.", () => {
            const ipcClient = ipc.createClient();

            assert.ok(SocketProxy.isValidChannel(ipcClient));
            ipcClient.destroy();
        });

        it("isValidChannel(): return false if channel is not valid net.Socket.", () => {
            assert.ok(!SocketProxy.isValidChannel({}));
        });
    });

    describe("instances", () => {
        it(".constructor()", () => {
            const ipcClient = ipc.createClient();
            const proxy = new SocketProxy(ipcClient);

            proxy.dispose();
        });

        it(".dispose()", () => new Promise((resolve, reject) => {
            const ipcClient = ipc.createClient();

            ipcClient.on("close", () => resolve());

            const proxy = new SocketProxy(ipcClient);

            proxy.dispose();
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

                const ipcClient = ipc.createClient();
                const proxy = new SocketProxy(ipcClient);

                proxy.setHandler("data", (channel, data) => {
                    assert.equal("Received.", data);
                    proxy.dispose();
                    resolve();
                });

                assert.equal(proxy.sendData({ msg: "helloWorld!!" }), true);
            });
        });
    });
});
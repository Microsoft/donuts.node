//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const net = require("net");
const { ChannelHostProxy } = require("./channel-host-proxy");
const { SocketProxy } = require("./socket-proxy");
const utils = require("donuts.node/utils");

/** @typedef {import("net").Server} SocketServer */
/** @typedef {import("net").Socket} Socket */
/** 
 * @template THost
 * @typedef {import("./channel-host-proxy").ChannelHostProxy<THost>} ChannelHostProxy
 */

/**
 * @class
 * @extends {ChannelHostProxy<SocketServer>}
 */
class SocketHostProxy extends ChannelHostProxy {
    /**
     * @public
     * @param {SocketServer} socketServer 
     * @returns {Donuts.Remote.IConnectionInfo}
     */
    static generateConnectionInfo(socketServer) {
        if (!(socketServer instanceof net.Server)) {
            throw new Error("socketServer must be a net.Server object.");
        }

        /** @type {*} */
        // @ts-ignore
        if (utils.isString(socketServer._pipeName)) {
            return {
                moduleName: "net",
                initFunction: "createServer",
                // @ts-ignore
                initFunctionParams: [{ path: socketServer._pipeName }]
            };

        } else {
            throw new Error("Unsupported net.Server.");
        }
    }

    /**
     * @return {Donuts.Remote.IConnectionInfo}
     */
    get connectionInfo() {
        return this._connectionInfo;
    }

    /**
     * 
     * @param {SocketServer} socketServer 
     */
    constructor(socketServer) {
        super(socketServer);

        if (!(socketServer instanceof net.Server)) {
            throw new Error("socketServer must be a net.Server");
        }

        /**
         * @private
         * @readonly
         * @type {Donuts.Remote.IConnectionInfo}
         */
        this._connectionInfo = SocketHostProxy.generateConnectionInfo(this.host);

        /**
         * @private
         * @readonly
         * @type {Array.<Socket>}
         */
        this._connections = [];

        /**
         * @private
         * @param {Socket} socket
         */
        this.onConnection = (socket) => {
            this._connections.push(socket);

            socket.once("close",
                () => this._connections.splice(
                    this._connections.findIndex((itemSocket) => itemSocket === socket),
                    1));

            this.emit("connection", new SocketProxy(socket));
        };

        /**
         * @private
         */
        this.onClose = () => this.emit("close");

        /**
         * @private
         * @param {Error} error
         */
        this.onError = (error) => this.emit("error", error);

        /**
         * @private
         */
        this.onListening = () => this.emit("listening");

        this.host.on("close", this.onClose);
        this.host.on("connection", this.onConnection);
        this.host.on("error", this.onError);
        this.host.on("listening", this.onListening);
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    async disposeAsync() {
        if (this.disposed) {
            await super.disposeAsync();
            return;
        }

        await new Promise((resolve, reject) => {
            this.host.close(() => resolve());

            for (const socket of this._connections) {
                socket.destroy();
            }

            this._connections.splice(0);
        });

        this.host
            .off("close", this.onClose)
            .off("connection", this.onConnection)
            .off("error", this.onError)
            .off("listening", this.onListening);

        await super.disposeAsync();
    }
}
exports.SocketHostProxy = SocketHostProxy;

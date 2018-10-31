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
        const handle = socketServer["_handle"];

        if (utils.isString(handle._pipeName)) {
            return {
                moduleName: "net",
                initFunction: "createServer",
                initFunctionParams: [{ path: handle._pipeName }]
            };

        } else {
            throw new Error("Unsupported net.Server.");
        }
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
         * @public
         * @readonly
         * @type {Donuts.Remote.IConnectionInfo}
         */
        this.connectionInfo = SocketHostProxy.generateConnectionInfo(this.host);

        this.host.on("close", this.onClose);
        this.host.on("connection", this.onConnection);
        this.host.on("error", this.onError);
        this.host.on("listening", this.onListening);
    }

    /**
     * @public
     * @returns {void}
     */
    dispose() {
        if (this.disposed) {
            return super.dispose();
        }

        this.host.off("close", this.onClose);
        this.host.off("connection", this.onConnection);
        this.host.off("error", this.onError);
        this.host.off("listening", this.onListening);

        super.dispose();
    }

    /**
     * @private
     * @param {Socket} socket
     */
    onConnection = (socket) => this.emit("connection", new SocketProxy(socket));

    /**
     * @private
     */
    onClose = () => this.emit("close");

    /**
     * @private
     * @param {Error} error
     */
    onError = (error) => this.emit("error", error);

    /**
     * @private
     */
    onListening = () => this.emit("listening");
}
exports.SocketHostProxy = SocketHostProxy;

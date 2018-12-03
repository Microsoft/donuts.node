//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

/** @typedef {import("net").Socket} NetSocket */
/** @typedef {import("net").Server} NetServer */
/** @typedef {import("../socket-adapter").SocketAdapter} SocketAdapter */

/** 
 * @template TOutgoingData, TIncommingData
 * @typedef {Donuts.Remote.ICommunicationPipeline<TOutgoingData, TIncommingData>} ICommunicationPipeline 
 */

/** @typedef {Donuts.Remote.ICommunicationSource} ICommunicationSource */

/** 
 * @template TData
 * @typedef {Donuts.Remote.IMessage<TData>} IMessage
 */

const { EventEmitter } = require("donuts.node/event-emitter");
const { SocketAdapter } = require("../socket-adapter");

/**
 * @class
 * @implements {ICommunicationSource}
 */
class SocketSource extends EventEmitter {
    /**
     * @public
     * @param {NetServer} server 
     * @param {number} [timeout] In milliseconds.
     */
    constructor(server, timeout) {
        const { Server } = require("net");

        if (!(server instanceof Server)) {
            throw new Error("server must be an instance of net.Server");
        }

        if (timeout !== undefined && timeout !== null
            && (typeof timeout !== "number" || !Number.isInteger(timeout) || timeout <= 0)) {
            throw new Error("timeout must be an positive integer.");
        }

        super();

        /**
         * @private
         * @readonly
         * @type {number}
         */
        this.timeout = timeout;

        /**
         * @private
         * @readonly
         * @type {NetServer}
         */
        this.server = server;

        server.on("connection",
            /**
             * @param {NetSocket} socket
             * @returns {void}
             */
            (socket) => {
                /** @type {SocketAdapter} */
                const adapter = new SocketAdapter(socket, this.timeout);
                const outgoingAsyncHandler = adapter.handleOutgoingMessage;

                socket.on("close",
                    /**
                     * @returns {void}
                     */
                    () => {
                        this.emit("target-lost", this, outgoingAsyncHandler);
                    });

                adapter.on("message",
                    /**
                     * @param {ICommunicationSource} source
                     * @param {IMessage<any>} incomingMessage
                     * @returns {void}
                     */
                    (source, incomingMessage) => {
                        this.emit("message", this, incomingMessage);
                    });

                this.emit("target-acquired", this, outgoingAsyncHandler);
            });
    }
}
exports.SocketSource = SocketSource;
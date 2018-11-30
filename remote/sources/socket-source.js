//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

/** @typedef {import("net").Socket} NetSocket */
/** @typedef {import("net").Server} NetServer */
/** @typedef {import("../outgoing-adapters/socket-adapter").SocketAdapter} SocketAdapter */

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
const { SocketAdapter } = require("../outgoing-adapters/socket-adapter");
const Random = require("donuts.node/random");

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

        /** 
         * @private
         * @readonly
         * @type {Donuts.IStringKeyDictionary<SocketAdapter>}
         */
        this.socketAdapterDictionary = Object.create(null);

        server.on("connection",
            /**
             * @param {NetSocket} socket
             * @returns {void}
             */
            (socket) => {
                /** @type {SocketAdapter} */
                const adapter = new SocketAdapter(socket, this.timeout);

                /** @type {string} */
                const targetName = Random.generateUid();

                socket.on("close",
                    /**
                     * @returns {void}
                     */
                    () => {
                        delete this.socketAdapterDictionary[targetName];

                        this.emit("target-lost", this, targetName);
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

                this.socketAdapterDictionary[targetName] = adapter;
                this.emit("target-acquired", this, targetName, adapter.handleOutgoingMessage);
            });

        server.on("close",
            /**
             * @returns {void}
             */
            () => {
                for (const targetName in this.socketAdapterDictionary) {
                    this.emit("target-lost", this, targetName);
                }
            });
    }

    /**
     * @public
     * @returns {Array<string>}
     */
    getTargetNames() {
        return Object.keys(this.socketAdapterDictionary);
    }
}
exports.SocketSource = SocketSource;
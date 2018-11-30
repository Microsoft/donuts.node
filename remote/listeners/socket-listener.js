//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

/** @typedef {import("net").Socket} NetSocket */
/** @typedef {import("net").Server} NetServer */

/** 
 * @template TOutgoingData, TIncommingData
 * @typedef {Donuts.Remote.ICommunicationPipeline<TOutgoingData, TIncommingData>} ICommunicationPipeline 
 */

/** @typedef {Donuts.Remote.ICommunicationSource} ICommunicationListener */

/** 
 * @template TData
 * @typedef {Donuts.Remote.IMessage<TData>} IMessage
 */

const { EventEmitter } = require("donuts.node/event-emitter");
const Log = require("donuts.node/logging").getLog();

/**
 * 
 */
class SocketListener extends EventEmitter {
    /**
     * @public
     * @param {NetServer} server 
     */
    constructor(server) {
        const { Server } = require("net");

        if (!(server instanceof Server)) {
            throw new Error("server must be an instance of net.Server");
        }

        super();

        server.on("connection", (socket) => {
            const adapter
        });
    }
}
exports.SocketListener = SocketListener;

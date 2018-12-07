//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/** @typedef {import("donuts.node/event-emitter").EventEmitter} EventEmitter */
/** @typedef {import("net").Socket} Socket */

/** 
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.ISource<TOutgoingData, TIncomingData>} ISource 
 */

/** 
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail 
 */

const { EventEmitter } = require("donuts.node/event-emitter");
const { Socket } = require("net");

/**
 * @template TOutgoingData, TIncomingData
 * @class
 * @extends {EventEmitter}
 * @implements {ISource<TOutgoingData, TIncomingData>}
 */
class SocketSource extends EventEmitter {
    /**
     * @public
     * @param {Socket} socket
     * @param {number} [timeout] timeout in milliseconds.
     */
    constructor(socket, timeout) {
        if (!(socket instanceof Socket)) {
            throw new Error("socket must be a valid net.Socket.");
        }

        super();

        /**
         * @private
         * @readonly
         * @type {Socket}
         */
        this.socket = socket;

        /**
         * @private
         * @readonly
         * @type {number}
         */
        this.timeout = timeout;
    }

    /**
     * @public
     * @param {IMail<TOutgoingData>} mail
     * @returns {Promise<IMail<TIncomingData>>}
     */
    sendAsync(mail) {
        
    }
}
exports.SocketSource = SocketSource;
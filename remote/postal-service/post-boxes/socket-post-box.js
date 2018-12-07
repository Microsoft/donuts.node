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
class SocketPostBox extends EventEmitter {
    /**
     * @public
     * @param {Socket} socket
     * @param {number} [timeout] timeout in milliseconds.
     * @param {string} [origin]
     */
    constructor(socket, timeout, origin) {
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

        /**
         * @private
         * @readonly
         * @type {string}
         */
        this._origin = origin || this.socket.localAddress;
    }

    /**
     * @public
     * @returns {string}
     */
    get origin() {
        return this._origin;
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
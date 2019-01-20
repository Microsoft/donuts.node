//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/** @typedef {import("donuts.node/event-emitter").EventEmitter} EventEmitter */
/** @typedef {Donuts.Remote.PostalService.OutgoingMailAsyncHandler} OutgoingMailAsyncHandler */
/** @typedef {Donuts.Remote.PostalService.IncomingMailAsyncHandler} IncomingMailAsyncHandler */
/** @typedef {Donuts.Remote.PostalService.IPostal} IPostal */

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail 
 */

const { EventEmitter } = require("donuts.node/event-emitter");

/**
 * @abstract
 * @class
 * @implements {IPostal}
 * @extends {EventEmitter}
 */
class Postal extends EventEmitter {
    constructor() {

    }

    
}
exports.Postal = Postal;
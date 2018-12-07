//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.IPostBox<TOutgoingData, TIncomingData>} IPostBox 
 */

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail 
 */

const random = require("donuts.node/random");
const utils = require("donuts.node/utils");
const { PostBox } = require("./post-box");

/**
 * @class
 * @template TOutgoingData, TIncomingData
 * @implements {IPostBox<TOutgoingData, TIncomingData>}
 */
class SimplePostBox {
    
}
exports.SimplePostBox = SimplePostBox;
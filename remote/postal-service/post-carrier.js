//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/** 
 * @template TOutgoingData, TIncomingData
 * @typedef {import("./post-box").Postbox<TOutgoingData, TIncomingData>} Postbox 
 */

const { Postbox } = require("./post-box");

/**
 * @template TOutgoingData, TIncomingData
 * @extends {Postbox<TOutgoingData, TIncomingData>}
 */
class PostCarrier extends Postbox {

    
}
exports.PostCarrier = PostCarrier;
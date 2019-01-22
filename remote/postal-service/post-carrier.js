//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/** @typedef {import("./postal").Postal} Postal */

const { Postal } = require("./postal");

/**
 * @class
 * @abstract
 * @extends {Postal}
 */
class PostCarrier extends Postal {
    /**
     * @public
     * @param {URL} url
     */
    constructor(url) {
        super(url);
    }
}
exports.PostCarrier = PostCarrier;
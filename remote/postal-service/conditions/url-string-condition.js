//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail
 */

/**
 * @class
 * @implements {Donuts.ICondition<IMail<any>>}
 */
class UrlStringCondition {
    /**
     * @public
     * @param {string} url
     */
    constructor(url) {
        if (typeof url !== "string") {
            throw new Error("url must be a string");
        }

        /**
         * @private
         * @readonly
         * @type {string}
         */
        this.url = url;
    }

    /**
     * @public
     * @param {IMail<any>} input 
     * @returns {boolean}
     */
    match(input) {
        return input.to && input.to.href === this.url;
    }
}
exports.UrlStringCondition = UrlStringCondition;
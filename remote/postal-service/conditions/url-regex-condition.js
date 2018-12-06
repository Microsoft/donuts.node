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
class UrlRegexCondition {
    /**
     * @public
     * @param {RegExp} regex
     */
    constructor(regex) {
        if (!(regex instanceof RegExp)) {
            throw new Error("regex must be an instance of RegExp");
        }

        /**
         * @private
         * @readonly
         * @type {RegExp}
         */
        this.regex = regex;
    }

    /**
     * @public
     * @param {IMail<any>} input
     * @returns {boolean} 
     */
    match(input) {
        return input.to && this.regex.test(input.to.href);
    }
}
exports.UrlRegexCondition = UrlRegexCondition;
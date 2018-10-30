//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/**
 * @class
 * @implements {Donuts.Remote.IRoutePattern}
 */
class RegexPattern {
    /**
     * 
     * @param {RegExp} pattern 
     */
    constructor(pattern) {
        /**
         * @readonly
         * @type {RegExp}
         */
        this.pattern = pattern;
    }

    /**
     * @returns {*}
     */
    getRaw() {
        return this.pattern;
    }

    /**
     * 
     * @param {Donuts.Remote.IRoutePattern} pattern
     * @returns {boolean} 
     */
    equals(pattern) {
        return pattern && pattern.getRaw() === this.pattern;
    }

    /**
     * 
     * @param {string} path 
     * @returns {boolean}
     */
    match(path) {
        return this.pattern.test(path);
    }
}
exports.RegexPattern = RegexPattern;

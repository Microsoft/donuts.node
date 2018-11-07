//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/**
 * @class
 * @implements {Donuts.Remote.IRoutePattern}
 */
class Regex {
    /**
     * @public
     * @param {RegExp} pattern 
     */
    constructor(pattern) {
        /** @type {string} */
        let flags = "";

        if (pattern.ignoreCase) {
            flags += "i";
        }

        if (pattern.multiline) {
            flags += "m";
        }

        if (pattern.unicode) {
            flags += "u";
        }

        /**
         * @readonly
         * @type {RegExp}
         */
        this.pattern = new RegExp(pattern, flags);
    }

    /**
     * @public
     * @returns {*}
     */
    getRaw() {
        return this.pattern;
    }

    /**
     * @public
     * @param {Donuts.Remote.IRoutePattern} pattern
     * @returns {boolean} 
     */
    equals(pattern) {
        return pattern && pattern.getRaw() === this.pattern;
    }

    /**
     * @public
     * @param {string} path 
     * @returns {Donuts.Remote.IRoutePathInfo}
     */
    match(path) {
        const match = this.pattern.exec(path);

        if (!match) {
            return undefined;
        }

        /** @type {Donuts.Remote.IRoutePathInfo} */
        const info = Object.create(null);

        info["~"] = path;

        for (let matchIndex = 0; matchIndex < match.length; matchIndex++) {
            info[matchIndex.toString()] = match[matchIndex];
        }

        return info;
    }
}
exports.Regex = Regex;

//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/**
 * @typedef IRoute
 * @property {RegExp} pattern
 * @property {any} target
 */

/** @type {RegExp} */
const Regex_MatchAll = /.*/ig;

/**
 * Encode a string for RegExp.
 * @param {string} str 
 * @returns {string} escapted string
 */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Generate regex for pattern URL (contains * or any as protocol). Otherwise, return href string.
 * @param {URL} url 
 * @returns {RegExp | string}
 */
function generateRouteKey(url) {
    // If url is null/undefined, means match all.
    if (!url) {
        return Regex_MatchAll;
    }

    // Check if any pattern is specified in the href.
    if (url.protocol !== "any:" && !url.href.includes("*")) {
        return url.href;
    }

    /** @type {string} */
    let href = "";

    // Handling protocol
    href += url.protocol === "any:" ? "[^:]+:" : escapeRegExp(url.protocol)
    href += "\\/\\/";

    // Handling auth/username/password
    if (url.username) {
        href += escapeRegExp(url.username) + ":" + escapeRegExp(url.password) + "@";

    } else {
        href += "([^:@]*:[^:@]*@)?";
    }

    // Handling host name
    href += !url.hostname || url.hostname === "*" ? "[^\\/]+" : escapeRegExp(url.hostname);

    // Handling port
    if (url.port) {
        href += url.port === "*" ? "(:[^\\/]+)?" : ":" + escapeRegExp(url.port);
    }

    // Handling path
    if (url.pathname) {
        href += url.pathname.split("/").map((segement) => segement === "*" ? "[^\\/]+" : escapeRegExp(segement)).join("\\/");

    } else {
        href += "((\\/[^\\/]*)+)?";
    }

    // Handling query/search
    if (url.search) {
        /** @type {Array<string>} */
        const searchParams = [];

        for (const [key, value] of url.searchParams.entries()) {
            searchParams.push(`${key === "*" ? "[^\\?=&]+" : escapeRegExp(key)}=${value === "*" ? "[^\\?=&]*" : escapeRegExp(value)}`);
        }

        href += "\\?" + searchParams.join("&");
    }

    // Handling hash
    if (url.hash) {
        href += url.hash === "#*" ? "#.*" : escapeRegExp(url.hash);

    } else {
        href += "(#.*)?";
    }

    return new RegExp(href, "ig");
}

/**
 * @class
 * @template T
 */
class Router {
    /**
     * @public
     */
    constructor() {
        /** @type {Map<string, T>} */
        let targetMap = new Map();

        /** @type {Array<IRoute>} */
        let targetRoutes = [];

        /**
         * @public
         * @param {URL} url
         * @return {T}
         */
        this.get = (url) => {
            const href = url.href;

            let target = targetMap.get(href);

            // Modify url for target map match
            if (!target) {
                const modifiedUrl = new URL("", url);

                // Try no hash
                modifiedUrl.hash = "";
                target = targetMap.get(modifiedUrl.href);

                // Try no query
                if (!target) {
                    modifiedUrl.search = "";
                    target = targetMap.get(modifiedUrl.href);
                }
            }

            // Try regex pattern routes.
            if (!target) {
                for (const route of targetRoutes) {
                    if (route.pattern.test(href)) {
                        target = route.target;
                        break;
                    }
                }
            }

            return target;
        };

        /**
         * @public
         * @param {URL} url
         * @param {T} target
         * @returns {this}
         */
        this.push = (url, target) => {
            /** @type {RegExp | string} */
            const routeKey = generateRouteKey(url);

            if (typeof routeKey === "string") {
                targetMap.set(routeKey, target);

            } else {
                targetRoutes.unshift({
                    pattern: routeKey,
                    target: target
                });
            }

            return this;
        };

        /**
         * @public
         * @param {URL} url
         * @returns {this}
         */
        this.delete = (url) => {
            /** @type {string} */
            const regexStr = generateRouteKey(url).toString();

            targetMap.delete(regexStr);

            for (let routeIndex = targetRoutes.length - 1; routeIndex >= 0; routeIndex--) {
                const route = targetRoutes[routeIndex];

                if (route.pattern.toString() === regexStr) {
                    targetRoutes.splice(routeIndex, 1);
                }
            }

            return this;
        };
    }
}
exports.Router = Router;
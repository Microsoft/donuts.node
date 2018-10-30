//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const url = require("url");
const path = require("path");
const utils = require("./utils");
const shell = require("./shell");

/**
 * @typedef IPathObject
 * @property {string} path
 * @property {string} [hash]
 * @property {string | *} [query]
 * @property {string} [search]
 */

/** @type {string} */
const appDir = shell.getAppDir();

/**
 * @param {string | IPathObject} pathObject
 * @param {boolean} [fromAppDir=false]
 * @returns {string}
 */
exports.resolve = (pathObject, fromAppDir) => {
    fromAppDir = fromAppDir || false;

    /** @type {import("url").UrlObject} */
    const urlObject = {
        protocol: "file:",
        slashes: true
    };

    if (utils.isString(pathObject)) {
        urlObject.pathname = exports.local(pathObject, fromAppDir);

    } else {
        urlObject.pathname = exports.local(pathObject.path, fromAppDir);

        if (pathObject.hash) {
            urlObject.hash = pathObject.hash;
        }

        if (pathObject.query) {
            urlObject.query = pathObject.query;
        }

        if (pathObject.search) {
            urlObject.search = pathObject.search;
        }
    }

    return url.format(urlObject);
}

/**
 * 
 * @param {string} target 
 * @param {boolean} [fromAppDir=false]
 * @returns {string}
 */
exports.local = (target, fromAppDir) => path.join(fromAppDir || false ? appDir : path.dirname(utils.getCallerModuleInfo().fileName), target);

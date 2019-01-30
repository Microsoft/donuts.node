//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const net = require("net");
const path = require("path");
const random = require("donuts.node/random");
const tmp = require("tmp");
const fileSystem = require("donuts.node/fileSystem");

/**
 * 
 * @param  {...string} segments 
 * @returns {string}
 */
function generateWin32IpcPath(...segments) {
    if (segments.length > 0) {
        return path.join("\\\\?\\pipe", ...segments);
    }

    return path.join("\\\\?\\pipe", process.mainModule.filename, random.generateUuidAlike());
}

/**
 * 
 * @param  {...string} segments 
 * @returns {string}
 */
function generateUnixIpcPath(...segments) {
    /** @type {string} */
    let filePath;

    if (segments.length > 0) {
        filePath = path.join("/", ...segments);

    } else {
        filePath = tmp.fileSync().name;
    }

    fileSystem.createDirectorySync(path.dirname(filePath));

    return filePath;
}

/**
 * @param {...string} segments
 * @returns {string}
 */
function generateIpcPath(...segments) {
    switch (process.platform) {
        case "win32":
            return generateWin32IpcPath(...segments);

        case "linux":
        case "darwin":
            return generateUnixIpcPath(...segments);

        default:
            throw new Error(`Unsupported platform: ${process.platform}`);
    }
}

/**
 * 
 * @param {...string} pathSegments 
 * @returns {Promise<import("net").Socket>}
 */
exports.connectAsync = (...pathSegments) => new Promise((resolve, reject) => {
    const client = net.connect({ path: generateIpcPath(...pathSegments) });

    client
        .once("connect", () => resolve(client))
        .once("error", (err) => reject(err));
});

/**
 * 
 * @param {...string} pathSegments 
 * @returns {Promise<import("net").Server>}
 */
exports.hostAsync = (...pathSegments) => new Promise((resolve, reject) => {
    const svr = net.createServer();

    svr.listen(
        generateIpcPath(...pathSegments),
        null,
        /**
         * @param {Error} e
         */
        (e) => {
            if (e) {
                reject(e);

            } else {
                resolve(svr);
            }
        });
}); 

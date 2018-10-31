//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const net = require("net");
const path = require("path");
const uuidv4 = require("uuid/v4");
const tmp = require("tmp");
const fileSytem = require("./fileSystem");

/**
 * 
 * @param  {...string} segements 
 * @returns {string}
 */
function generateWin32IpcPath(...segements) {
    if (segements.length > 0) {
        return path.join("\\\\?\\pipe", ...segements);
    }

    return path.join("\\\\?\\pipe", process.mainModule.filename, uuidv4());
}

/**
 * 
 * @param  {...string} segements 
 * @returns {string}
 */
function generateUnixIpcPath(...segements) {
    /** @type {string} */
    let filePath;

    if (segements.length > 0) {
        filePath = path.join(...segements);

    } else {
        filePath = tmp.fileSync().name;
    }

    fileSytem.createDirectorySync(path.dirname(filePath));

    return filePath;
}

/**
 * @param {...string} segements
 * @returns {string}
 */
function generateIpcPath(...segements) {
    switch (process.platform) {
        case "win32":
            return generateWin32IpcPath(...segements);

        case "linux":
        case "darwin":
            return generateUnixIpcPath(...segements);

        default:
            throw new Error(`Unsupported platform: ${process.platform}`);
    }
}

/**
 * 
 * @param {...string} pathSegements 
 * @returns {import("net").Socket}
 */
exports.connect = (pathSegements) => net.connect({ path: generateIpcPath(pathSegements) });

/**
 * 
 * @param {...string} pathSegements 
 * @returns {import("net").Server}
 */
exports.host = (pathSegements) => net.createServer().listen(generateIpcPath(pathSegements));

//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const net = require("net");
const path = require("path");
const uuidv4 = require("uuid/v4");
const tmp = require("tmp");
const utils = require("./utils");
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
exports.generateIpcPath = (...segements) => {
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
 * @param {string} ipcPath 
 * @returns {import("net").Socket}
 */
exports.connect = (ipcPath) => {
    if (!utils.isString(ipcPath)) {
        throw new Error("ipcPath must be a string.");
    }

    return net.connect({ path: ipcPath });
}

/**
 * 
 * @param {string} ipcPath 
 * @returns {import("net").Server}
 */
exports.host = (ipcPath) => {
    if (!utils.isString(ipcPath)) {
        throw new Error("ipcPath must be a string.");
    }

    return net.createServer().listen(ipcPath);
}

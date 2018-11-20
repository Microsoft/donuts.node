//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const utils = require("./utils");
const crypto = require("crypto");

/**
 * @param {number} [size]
 * @returns {Buffer}
 */
exports.randomize = (size) => {
    if (utils.isNullOrUndefined(size)) {
        size = 16;

    } else if (!utils.isNumber(size) || !Number.isInteger(size)) {
        throw new Error("size must be an integer.");
    }

    return crypto.randomFillSync(Buffer.alloc(size));
};

/** 
 * @param {number} [length]
 * @returns {string}
 */
exports.generateUid = (length) => {
    if (utils.isNullOrUndefined(length)) {
        length = 6;

    } else if (!utils.isNumber(length) || !Number.isInteger(length)) {
        throw new Error("length must be an integer.");
    }

    const generatedUid = exports.randomize(Math.ceil(length / 2)).toString("hex");

    if (generatedUid.length !== length) {
        return generatedUid.substr(0, length);
    }

    return generatedUid;
};

/** 
 * Generates a version 4 UUID-alike uid.
 * NOTE: Generated Uid is not a full-qualified UUID (version 4).
 * @returns {string}
 */
exports.generateUuidAlike = () => {
    const generatedUid = exports.generateUid(32);

    return `${generatedUid.substr(0, 8)}-${generatedUid.substr(8, 4)}-4${generatedUid.substr(13, 3)}-${generatedUid.substr(16, 4)}-${generatedUid.substr(20,12)}`;
};

/**
 * @returns {number}
 */
exports.randomUInt = () => exports.randomize(4).readUInt32LE(0);

/**
 * @returns {number}
 */
exports.randomUShort = () => exports.randomize(4).readUInt16LE(0);

/**
 * @returns {number}
 */
exports.randomByte = () => exports.randomize(1).readUInt8(0);
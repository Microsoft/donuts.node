//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const utils = require("donuts.node/utils");

/** @type {Donuts.Remote.IDataInfo} */
const True = {
    type: "boolean",
    value: true
};

/** @type {Donuts.Remote.IDataInfo} */
const False = {
    type: "boolean",
    value: false
};

/** @type {Donuts.Remote.IDataInfo} */
const Null = {
    type: "null",
    value: null
};

/** @type {Donuts.Remote.IDataInfo} */
const Undefined = {
    type: "undefined",
    value: undefined
};

/** @enum {Donuts.Remote.IDataInfo} */
exports.DataTypes = {
    True: True,
    False: False,
    Null: Null,
    Undefined: Undefined
};

/**
 * @param {*} data
 * @returns {Donuts.Remote.DataType}
 */
exports.dataTypeOf = (data) => {
    const sysType = typeof data;

    switch (sysType) {
        case "object":
            if (data === null) {
                return "null";
            } else if (data instanceof Buffer) {
                return "node.buffer";
            }

            return "object";

        default:
            return sysType;
    }
}

/**
 * 
 * @param {Donuts.Remote.IDataInfo} dataInfo 
 * @returns {dataInfo is IDataInfo}
 */
exports.isDataInfo =
    (dataInfo) =>
        !utils.string.isEmptyOrWhitespace(dataInfo.type)
        && utils.isString(dataInfo.type);

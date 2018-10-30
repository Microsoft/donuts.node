//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const utils = require("./utils");

/**
 * @typedef {(...args: Array<any>)=> any} Descriptor
 */

/**
 * 
 * @param {Descriptor} typeDescriptor 
 * @param {Array.<string>} injects 
 * @returns {Donuts.DI.IDiDescriptor}
 */
exports.dedication = (typeDescriptor, injects) => {
    if (!utils.isFunction(typeDescriptor)) {
        throw new Error("typeDescriptor must be a function.");
    }

    if (utils.array.isNullUndefinedOrEmpty(injects)) {
        injects = undefined;
    } else if (!Array.isArray(injects)) {
        throw new Error("inject must be an array of string.");
    } else {
        for (let injectIndex = 0; injectIndex < injects.length; injectIndex++) {
            const inject = injects[injectIndex];

            if (utils.string.isEmptyOrWhitespace(inject)) {
                injects[injectIndex] = undefined;
            } else if (!utils.isString(inject)) {
                throw new Error("Inject identity must be a string.");
            }
        }
    }

    return (container, ...extraArgs) => {
        /** @type {Array.<*>} */
        const args = [];

        if (injects !== undefined) {
            for (let injectIndex = 0; injectIndex < injects.length; injectIndex++) {
                const inject = injects[injectIndex];

                if (inject !== undefined) {
                    const arg = container.getDep(inject);

                    if (arg === undefined) {
                        throw new Error(`Required inject, "${inject}", is not available in the container.`);
                    }

                    args.push(arg);
                } else {
                    args.push(null);
                }
            }
        }

        if (Array.isArray(extraArgs) && extraArgs.length > 0) {
            for (let extraArgIndex = 0; extraArgIndex < extraArgs.length; extraArgIndex++) {
                args.push(extraArgs[extraArgIndex]);
            }
        }

        return typeDescriptor(...args);
    };
}

/**
 * 
 * @param {*} instance 
 * @returns {Donuts.DI.IDiDescriptor}
 */
exports.singleton = (instance) => (container) => instance;

/**
 * 
 * @param {Descriptor} typeDescriptor 
 * @param {Array.<string>} injects 
 * @returns {Donuts.DI.IDiDescriptor}
 */
exports.lazySingleton = (typeDescriptor, injects) => {
    let descriptor = exports.dedication(typeDescriptor, injects);
    
    /** @type {*} */
    let singleton = undefined;

    return (container, ...extraArgs) => {
        if (singleton === undefined) {
            singleton = descriptor(container, ...extraArgs);
            descriptor = undefined;
        }

        return singleton;
    };
}

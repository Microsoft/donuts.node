//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const utils = require("./utils");

/**
 * @class
 * @implements {di.IDiDescriptorDictionary}
 */
class DiDescriptorDictionary {
    constructor() {
        /** @type {Object.<string, Donuts.DI.IDiDescriptor>} */
        this.descriptorDictionary = Object.create(null);
    }

    /**
     * 
     * @param {string} name 
     * @return {Donuts.DI.IDiDescriptor}
     */
    get(name) {
        if (utils.string.isEmptyOrWhitespace(name)) {
            throw new Error("name should not be null/undefined/empty.");
        }

        return this.descriptorDictionary[name];
    }

    /**
     * 
     * @param {string} name 
     * @param {Donuts.DI.IDiDescriptor} descriptor 
     * @returns {void}
     */
    set(name, descriptor) {
        if (utils.string.isEmptyOrWhitespace(name)) {
            throw new Error("name should not be null/undefined/empty.");
        }

        if (utils.isNullOrUndefined(descriptor)) {
            delete this.descriptorDictionary[name];
        } else {
            this.descriptorDictionary[name] = descriptor;
        }
    }
}
exports.DiDescriptorDictionary = DiDescriptorDictionary;

/**
 * @class
 * @implements {di.IDiContainer}
 */
class DiContainer {
    /**
     * 
     * @param {Donuts.DI.IDiDescriptorDictionary} [dictionary]
     */
    constructor(dictionary) {
        /** @type {Donuts.DI.IDiDescriptorDictionary} */
        /** @readonly */
        this.descriptorDictionary = undefined;

        if (utils.isNullOrUndefined(dictionary)) {
            this.descriptorDictionary = new DiDescriptorDictionary();
        } else {
            this.descriptorDictionary = dictionary;
        }
    }

    /**
     * @template T
     * 
     * @param {string} name 
     * @param  {...*} extraArgs 
     * @returns {T}
     */
    getDep(name, ...extraArgs) {
        const descriptor = this.get(name);

        if (utils.isNullOrUndefined(descriptor)) {
            return undefined;
        } else {
            return descriptor(this, ...extraArgs);
        }
    }

    /**
     * 
     * @param {string} name 
     * @returns {Donuts.DI.IDiDescriptor}
     */
    get(name) {
        if (utils.string.isEmptyOrWhitespace(name)) {
            throw new Error("name should not be null/undefined/empty.");
        }

        return this.descriptorDictionary.get(name);
    }

    /**
     * 
     * @param {string} name 
     * @param {Donuts.DI.IDiDescriptor} descriptor 
     * @returns {Donuts.DI.IDiContainer}
     */
    set(name, descriptor) {
        if (utils.string.isEmptyOrWhitespace(name)) {
            throw new Error("name should not be null/undefined/empty.");
        }

        if (utils.isNullOrUndefined(descriptor)) {
            this.descriptorDictionary.set(name, undefined);
        } else {
            this.descriptorDictionary.set(name, descriptor);
        }

        return this;
    }
}
exports.DiContainer = DiContainer;

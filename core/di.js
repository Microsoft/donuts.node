//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const utils = require("./utils");

/**
 * @class
 * @implements {Donuts.DI.IDiDescriptorDictionary}
 */
class DiDescriptorDictionary {
    constructor() {
        /** @type {Object.<string, Donuts.DI.IDiDescriptor.<*>>} */
        this.descriptorDictionary = Object.create(null);
    }

    /**
     * @template T
     * @param {string} name 
     * @return {Donuts.DI.IDiDescriptor.<T>}
     */
    get(name) {
        if (!utils.isString(name)) {
            throw new Error("name must be a string.");
        }

        return this.descriptorDictionary[name];
    }

    /**
     * 
     * @param {string} name 
     * @param {Donuts.DI.IDiDescriptor.<*>} descriptor 
     * @returns {this}
     */
    set(name, descriptor) {
        if (!utils.isString(name)) {
            throw new Error("name must be a string.");
        }

        if (utils.isNullOrUndefined(descriptor)) {
            delete this.descriptorDictionary[name];

        } else {
            this.descriptorDictionary[name] = descriptor;
        }

        return this;
    }
}
exports.DiDescriptorDictionary = DiDescriptorDictionary;

/**
 * @class
 * @implements {Donuts.DI.IDiContainer}
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
     * @public
     * @template T 
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
     * @public
     * @template T
     * @param {string} name 
     * @returns {Donuts.DI.IDiDescriptor.<T>}
     */
    get(name) {
        if (!utils.isString(name)) {
            throw new Error("name must be a string.");
        }

        return this.descriptorDictionary.get(name);
    }

    /**
     * 
     * @param {string} name 
     * @param {Donuts.DI.IDiDescriptor.<*>} descriptor 
     * @returns {this}
     */
    set(name, descriptor) {
        if (!utils.isString(name)) {
            throw new Error("name must be a string.");
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

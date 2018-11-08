//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { dataTypeOf } = require("./data-info");
const utils = require("donuts.node/utils");
const uuidv4 = require("uuid/v4");
const weak = require("donuts.node-weak");

/**
 * @class
 */
class DataInfoManager {
    /**
     * 
     * @param {Donuts.Remote.IObjectRemotingProxy} objectRemotingProxy 
     */
    constructor(objectRemotingProxy) {
        if (!objectRemotingProxy) {
            throw new Error("objectRemotingProxy must be supplied.");
        }

        /**
         * @readonly
         * @type {Donuts.Remote.IObjectRemotingProxy}
         */
        this.proxy = objectRemotingProxy;

        /** 
         * @readonly
         * @type {Object.<string, *>} 
         * */
        this.localRefs = Object.create(null);

        /**
         * @readonly
         * @type {Object.<string, Donuts.Weak.NativeWeakReference<*>>}
         */
        this.remoteRefs = Object.create(null);

        /**
         * @readonly
         * @type {symbol}
         */
        this.symbol_dataInfo = Symbol("dataInfo");
    }

    /**
     * @public
     * Get the object by refId.
     * @param {string} refId 
     * @returns {object | function}
     */
    get(refId) {
        const value = this.localRefs[refId];

        if (utils.isNullOrUndefined(value)) {
            return undefined;
        }

        return value;
    }

    /**
     * @public
     * Realize the given IDataInfo to a local object proxy.
     * @param {Donuts.Remote.IDataInfo} dataInfo 
     * @returns {*}
     */
    realizeDataInfo(dataInfo) {
        if (dataInfo.id) {
            const existingValue = this.get(dataInfo.id);

            if (!utils.isNullOrUndefined(existingValue)) {
                return existingValue;
            }

            if (dataInfo.type === "object") {
                // @ts-ignore
                return this.realizeObjectDataInfo(dataInfo);

            } else if (dataInfo.type === "function") {
                return this.realizeFunctionDataInfo(dataInfo);

            } else {
                throw new Error(`Unsupported DataType for IDataInfo with an id: ${dataInfo.type}.`);
            }
        }

        if (dataInfo.type === "node.buffer") {
            return Buffer.from(dataInfo.value.data, "base64");
        }

        if (!dataInfo.value) {
            return dataInfo.value;
        }

        return JSON.parse(dataInfo.value,
            (key, value) => {
                if (key === "" || typeof value !== "string") {
                    return value;
                }

                const separatorIndex = value.indexOf(":");

                if (separatorIndex <= 0) {
                    return value;
                }

                /** @type {Donuts.Remote.DataType} */
                // @ts-ignore
                const dataType = value.substring(0, separatorIndex);

                switch (dataType) {
                    case "string":
                        return value.substring(separatorIndex + 1);

                    case "node.buffer":
                        return Buffer.from(value.substring(separatorIndex + 1), "base64");

                    default:
                        return value;
                }
            });
    }

    /**
     * @public
     * Get the refId from the given object.
     * @param {*} target 
     * @returns {string} The refId attached to the object. Otherwise, undefined.
     */
    getRefId(target) {
        if (utils.isNullOrUndefined(target)) {
            return undefined;
        }

        /** @type {Donuts.Remote.IDataInfo} */
        const dataInfo = target[this.symbol_dataInfo];

        if (!dataInfo) {
            return undefined;
        }

        return dataInfo.id;
    }

    /**
     * @public
     * @param {*} target 
     * @param {boolean} [recursive]
     * @returns {Donuts.Remote.IDataInfo}
     */
    toDataInfo(target, recursive) {
        /** @type {Donuts.Remote.IDataInfo} */
        let dataInfo;

        if (target) {
            dataInfo = target[this.symbol_dataInfo];
        }

        dataInfo = dataInfo || { type: dataTypeOf(target) };
        recursive = !(recursive === false);

        if (dataInfo.id) {
            // Existing dataInfo.

        } else if (dataInfo.type === "node.buffer") {
            dataInfo.value = (target).toString("base64");

        } else if (utils.object.isSerializable(target)) {
            dataInfo.value = JSON.stringify(target,
                (key, value) => {
                    if (key === "") {
                        return value;
                    }

                    if (typeof value === "string") {
                        return `${"string"}:${value}`;
                    }

                    if (value && value.type === "Buffer" && Array.isArray(value.data)) {
                        return `${"node.buffer"}:${Buffer.from(value.data).toString("base64")}`;
                    }

                    return value;
                });

        } else if (recursive && dataInfo.type === "object") {
            dataInfo = this.toObjectDataInfo(target);

        } else if (dataInfo.type === "function") {
            dataInfo = this.toFunctionDataInfo(target);

        } else {
            throw new Error(`Unsupported DataType of the given target: ${dataInfo.type}`);
        }

        this.localRefs[dataInfo.id] = target;
        return dataInfo;
    }

    /**
     * @public
     * Remove the reference hold for the data info referenced by refId.
     * @param {string} refId 
     * @return {void}
     */
    delDataInfo(refId) {
        if (!utils.isString(refId)) {
            throw new Error("refId must be an string");
        }

        delete this.localRefs[refId];
    }

    /**
     * @private
     * @param {*} target
     */
    toFunctionDataInfo(target) {
        /** @type {Donuts.Remote.IDataInfo} */
        let dataInfo = target[this.symbol_dataInfo];

        if (!dataInfo) {
            dataInfo = {
                type: "function",
                id: uuidv4()
            };
        }

        return target[this.symbol_dataInfo] = dataInfo;
    }

    /**
     * @private
     * @param {object} target 
     * @returns {Donuts.Remote.IDataInfo}
     */
    toObjectDataInfo(target) {
        /** @type {Donuts.Remote.IObjectDataInfo} */
        let dataInfo = target[this.symbol_dataInfo];

        if (dataInfo) {
            return dataInfo;
        }

        dataInfo = {
            type: "object",
            id: uuidv4(),
            memberInfos: Object.create(null)
        };

        const memberInfos = dataInfo.memberInfos;

        let currentObj = target;

        while (currentObj && currentObj !== Object.prototype) {
            const propertyDescriptors = Object.getOwnPropertyDescriptors(currentObj);
            // @ts-ignore "constructor" value is the same as other properties.
            const isClass = utils.isFunction(propertyDescriptors["constructor"].value);

            for (const propertyName in propertyDescriptors) {
                const propertyDescriptor = propertyDescriptors[propertyName];

                // ignore the member in parent class.
                if (propertyName in memberInfos) {
                    continue;
                }

                // if the member is pure-constant value.
                if ((!propertyDescriptor.writable
                    && !propertyDescriptor.configurable
                    && !propertyDescriptor.get
                    && !propertyDescriptor.set)
                    // if the member is a non-enumerable function in the class.
                    || (isClass
                        && !propertyDescriptor.enumerable
                        && utils.isFunction(propertyDescriptor.value))) {
                    memberInfos[propertyName] = this.toDataInfo(propertyDescriptor.value, false);
                }
            }

            currentObj = Object.getPrototypeOf(currentObj);
        }

        return target[this.symbol_dataInfo] = dataInfo;
    }

    /**
     * @private
     * @template T
     * @param {T} obj
     * @returns {T}
     */
    registerRealizedObject(obj) {
        /** @type {Donuts.Weak.WeakReference<*>} */
        const weakRef = weak.create(obj);

        /** @type {Donuts.Remote.IDataInfo} */
        // @ts-ignore
        const dataInfo = obj[this.symbol_dataInfo];

        /** @type {string} */
        const refId = dataInfo.id;

        weakRef.on("died", () => {
            this.proxy.releaseAsync(refId);
            delete this.remoteRefs[refId];
        });

        this.remoteRefs[refId] = weakRef;

        return obj;
    }

    /**
     * @private
     * @param {Donuts.Remote.IDataInfo} dataInfo 
     * @returns {*}
     */
    realizeFunctionDataInfo(dataInfo) {
        const weakRef = this.remoteRefs[dataInfo.id];

        if (weakRef && !weakRef.isDead()) {
            return weakRef.ref();
        }

        /** @type {()=>void} */
        const base = () => undefined;

        // @ts-ignore
        base[this.symbol_dataInfo] = dataInfo;

        /** @type {string} */
        const refId = dataInfo.id;

        /** @type {ProxyHandler<Function>} */
        const handlers = {
            /**
             * @param {Function} target
             * @param {*} thisArg
             * @param {Array.<*>} args
             * @returns {Promise<*>} 
             */
            apply: async (target, thisArg, args) => await this.proxy.applyAsync(refId, thisArg, args)
        };

        const funcProxy = new Proxy(base, handlers);

        this.registerRealizedObject(funcProxy);

        return funcProxy;
    }

    /**
     * @private
     * @param {Donuts.Remote.IObjectDataInfo} dataInfo 
     * @returns {*}
     */
    realizeObjectDataInfo(dataInfo) {
        const weakRef = this.remoteRefs[dataInfo.id];

        if (weakRef && !weakRef.isDead()) {
            return weakRef.ref();
        }

        /** @type {object} */
        const base = Object.create(null);

        base[this.symbol_dataInfo] = dataInfo;

        /** @type {string} */
        const refId = dataInfo.id;

        /** @type {ProxyHandler.<object>} */
        const handlers = {
            /**
             * @param {*} target
             * @param {string | number | symbol} property
             * @param {object} receiver 
             * @returns {Promise<*> | *}
             */
            get: (target, property, receiver) => {
                const baseValue = target[property];

                if (baseValue || typeof property === "symbol") {
                    return baseValue;
                }

                return this.proxy.getPropertyAsync(refId, property);
            },

            /**
             * @param {*} target
             * @param {string | number | symbol} property
             * @param {*} value
             * @param {object} receiver 
             * @returns {boolean}
             */
            set: (target, property, value, receiver) => {
                if (typeof property === "symbol") {
                    target[property] = value;
                    return true;
                }

                if (property in target) {
                    return false;
                }

                this.proxy.setPropertyAsync(refId, property, value);
                return true;
            },

            /**
             * @param {*} target
             * @param {string | number | symbol} prop
             * @return {Boolean}
             */
            has: (target, prop) => true
        };

        const objProxy = new Proxy(base, handlers);

        if (dataInfo.memberInfos) {
            for (const propertyName of Object.getOwnPropertyNames(dataInfo.memberInfos)) {
                Object.defineProperty(base, propertyName, {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: this.realizeDataInfo(dataInfo.memberInfos[propertyName])
                });
            }
        }

        return this.registerRealizedObject(objProxy);
    }
}
exports.DataInfoManager = DataInfoManager;
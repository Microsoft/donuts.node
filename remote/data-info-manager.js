//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const { dataTypeOf } = require("./data-info");
const utils = require("donuts.node/utils");
const uuidv4 = require("uuid/v4");
const weak = require("donuts.node-weak");

/**
 * @class
 */
class DataInfoManager {
    constructor() {
        /** 
         * @readonly
         * @type {Donuts.IDictionary.<*>} 
         * */
        this.localRefs = Object.create(null);

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
     * @private
     * @param {*} target 
     * @param {boolean} [recursive]
     * @returns {Donuts.Remote.IDataInfo}
     */
    toDataInfo(target, recursive) {
        /** @type {Donuts.Remote.IDataInfo} */
        let dataInfo = target ? target[this.symbol_dataInfo] : { type: dataTypeOf(target) };

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
            return this.toObjectDataInfo(target);

        } else if (dataInfo.type === "function") {
            dataInfo = this.toFunctionDataInfo(target);

        } else {
            throw new Error(`Unsupported DataType of the given target: ${dataInfo.type}`);
        }

        this.localRefs[dataInfo.id] = target;
        return dataInfo;
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
     * @param {Donuts.Remote.IDataInfo} dataInfo 
     * @param {string} [parentId]
     * @returns {*}
     */
    realizeFunctionDataInfo(dataInfo, parentId) {
        const base = () => undefined;

        base[FuncName_DisposeAsync] = this.generateDisposeFunc(dataInfo.id, parentId);

        const handlers: ProxyHandler<Function> = {
            apply: async (target, thisArg, args): Promise<any> => {
                const refId = this.refRoot.getRefId(target);
                const thisArgDataInfo = this.toDataInfo(thisArg, refId);
                const argsDataInfos: Array<IDataInfo> = [];

                for (const arg of args) {
                    argsDataInfos.push(this.toDataInfo(arg, refId));
                }

                const resultDataInfo = await this.delegation.applyAsync(refId, thisArgDataInfo, argsDataInfos);

                return this.realizeDataInfo(resultDataInfo, refId);
            }
        };

        const funcProxy = new Proxy(base, handlers);
        const parentRef = this.refRoot.referById(parentId);

        parentRef.addReferee(funcProxy, dataInfo.id);

        return funcProxy;
    }

    /**
     * @private
     * @param {IObjectDataInfo} dataInfo 
     * @param {string} [parentId]
     * @returns {*}
     */
    realizeObjectDataInfo(dataInfo, parentId) {
        const base = Object.create(null);
        const handlers: ProxyHandler<Function> = {
            get: (target, property, receiver): any | Promise<any> => {
                const baseValue = target[property];

                if (baseValue || typeof property === "symbol") {
                    return baseValue;
                }

                const refId = this.refRoot.getRefId(target);

                const resultDataInfoPromise = this.delegation.getPropertyAsync(refId, property);

                return resultDataInfoPromise.then((resultDataInfo) => this.realizeDataInfo(resultDataInfo, refId));
            },

            set: (target, property, value, receiver) => {
                if (typeof property === "symbol") {
                    target[property] = value;
                    return true;
                }

                if (property in target) {
                    return false;
                }

                const refId = this.refRoot.getRefId(target);
                const valueDataInfo = this.toDataInfo(value, refId);

                this.delegation.setPropertyAsync(refId, property, valueDataInfo);
                return true;
            },

            has: (target, prop): boolean => {
                return true;
            }
        };

        const objProxy = new Proxy(base, handlers);
        const parentRef = this.refRoot.referById(parentId);

        // Register the dataInfo before initialize the members.
        parentRef.addReferee(objProxy, dataInfo.id);

        if (dataInfo.memberInfos) {
            for (const propertyName of Object.getOwnPropertyNames(dataInfo.memberInfos)) {
                Object.defineProperty(base, propertyName, {
                    enumerable: false,
                    configurable: false,
                    writable: propertyName === FuncName_DisposeAsync,
                    value: this.realizeDataInfo(dataInfo.memberInfos[propertyName], dataInfo.id)
                });
            }
        }

        base[FuncName_DisposeAsync] = this.generateDisposeFunc(dataInfo.id, parentId, base[FuncName_DisposeAsync]);

        return objProxy;
    }
}
exports.DataInfoManager = DataInfoManager;
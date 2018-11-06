//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/**
 * @typedef CallerInfo 
 * @property {string} fileName
 * @property {string} functionName
 * @property {string} typeName
 * @property {number} lineNumber
 * @property {number} columnNumber
 */

const Symbol_Serializable = Symbol("serializable");

/**
 * Check if the object is null or undefined.
 * @param {*} value The object to check
 * @returns {value is undefined | null} True if the value is null or undefined. Otherwise, false.
 */
exports.isNullOrUndefined = (value) => value === undefined || value === null;

/**
 * Check if the value is a symbol.
 * @param {*} value The value to check.
 * @returns {value is symbol} True if the value is symbol. Otherwise, false.
 */
exports.isSymbol = (value) => typeof value === "symbol";

/**
 * Check if the value is string.
 * @param {*} value The value to check.
 * @returns {value is string} True if the value is a string. Otherwise, false.
 */
exports.isString = (value) => typeof value === "string" || value instanceof String;

/**
 * Check if the value is a function.
 * @param {*} value The value to check.
 * @returns { value is Function} True if the value is a function. Otherwise, false.
 */
exports.isFunction = (value) => typeof value === "function";

/**
 * Check if the value is an object.
 * @param {*} value The value to check.
 * @returns {value is object} True if the value is an object. Otherwise, false.
 */
exports.isObject = (value) => value !== null && typeof value === "object";

/**
 * Check if the value is a number.
 * @param {*} value The value to check
 * @returns {value is number} True if the value is a number. Otherwise, false.
 */
exports.isNumber = (value) => typeof value === "number";

exports.string = {
    /**
     * Check if there is possiblity that the value is a string.
     * @param {*} value The value to check.
     * @returns {value is string} True if the value is null/undefined/string. Otherwise, false.
     */
    possibleString(value) {
        return exports.isNullOrUndefined(value) || exports.isString(value);
    },

    /**
     * Check if the string value is empty.
     * @param {string} value The value to check.
     * @returns {boolean} True if the string value is empty. Othersise, false.
     */
    isEmpty(value) {
        return value === "";
    },

    /**
     * Check if the string value is empty or whitespaces.
     * @param {string} value The value to check.
     * @returns {boolean} True if the string value is empty or whitespaces. Otherwise, false.
     */
    isEmptyOrWhitespace(value) {
        return value.trim() === "";
    },

    /**
     * 
     * @param {*} obj 
     * @param {number} [padding]
     * @returns {string}
     */
    defaultStringifier(obj, padding) {
        padding = exports.pick(padding, 0);

        if (obj === null) {
            return "null";

        } else if (obj === undefined) {
            return "undefined";

        } else {
            const objType = typeof obj;

            if ((objType !== "object")
                || (objType === "object"
                    && exports.isFunction(obj.toString)
                    && obj.toString !== Object.prototype.toString)) {
                return obj.toString();

            } else {
                /** @type {string} */
                let str = `\n${"".padStart(padding)}{\n`;

                for (const propertyName of Object.getOwnPropertyNames(obj)) {
                    str += `${"".padStart(padding + 4)}${propertyName}: ${exports.string.defaultStringifier(obj[propertyName], padding + 4)}\n`;
                }

                str += `${"".padStart(padding)}}`;

                return str;
            }
        }
    },

    /**
     * @param {*} obj
     * @return {string}
     */
    stringifier(obj) {
        return exports.string.defaultStringifier(obj);
    },

    /**
     * Form a string based on a given format string with the args and a customized stringifier function.
     * @param {(obj: any) => string} stringifier The function to stringify the value of an arg.
     * @param {string} format The format string.
     * @param {Array.<*>} args The args to form the string format.
     * @returns {string} The formated string.
     */
    formatEx(stringifier, format, ...args) {
        if (!exports.isFunction(stringifier)) {
            throw new Error("stringifier must be a function.");
        }

        if (!exports.isString(format)) {
            throw new Error("format must be a string");
        }

        if (!Array.isArray(args)) {
            throw new Error("args must be an array.");
        }

        if (args === null || args === undefined) {
            return format;
        }

        let matchIndex = -1;

        return format.replace(/(\{*)(\{(\d*)\})/gi,
            /**
             * @param {string} substring
             * @param {string} escapeChar
             * @param {string} argIdentifier
             * @param {string} argIndexStr
             * @returns {string}
             */
            (substring, escapeChar, argIdentifier, argIndexStr) => {
                matchIndex++;

                if (escapeChar.length > 0) {
                    return argIdentifier;
                }

                const argIndex = argIndexStr.length === 0 ? matchIndex : parseInt(argIndexStr, 10);

                if (isNaN(argIndex) || argIndex < 0 || argIndex >= args.length) {
                    throw new Error(`Referenced arg index, '${argIndexStr}',is out of range of the args.`);
                }

                return stringifier(args[argIndex]);
            });
    },

    /**
     * Form a string based on a given format string with the args.
     * @param {string} format The format string.
     * @param {Array.<*>} args The args to form the string format.
     * @returns {string} The formated string.
     */
    format(format, ...args) {
        return exports.string.formatEx(exports.string.defaultStringifier, format, ...args);
    }
};

exports.object = {
    /**
     * Check if an object is empty or not. It also checks if the prototype chains are empty (pure empty).
     * @param {object} value The target object to be checked. Error will be thrown if the value is null or undefined.
     * @returns {boolean} True if the object is empty include the prototype chains are also empty. 
     * Otherwise, false.
     */
    isEmpty(value) {
        if (exports.isNullOrUndefined(value)) {
            throw new Error("value cannot be null/undefined.");
        }

        // @ts-ignore
        for (const key in value) {
            return false;
        }

        return true;
    },

    /**
     * Check if the value is serializable. 
     * @param {*} value The value to be checked.
     * @return {boolean} True if the value is serializable for sure. Otherwise, false, 
     * which indicates the value cannot be serialized or cannot be determined whether it can be serialized or not.
     */
    isSerializable(value) {
        const valueType = typeof value;

        switch (valueType) {
            case "object":
                if (value === null) {
                    return true;
                }

                if (Object.prototype.hasOwnProperty.call(value, Symbol_Serializable)) {
                    return value[Symbol_Serializable] === true;
                }

                if (exports.isFunction(value["toJSON"])) {
                    return true;
                }

                if (Array.isArray(value)) {
                    return value.every((itemValue) => exports.object.isSerializable(itemValue));
                }

                const valuePrototype = Object.getPrototypeOf(value);

                return (!valuePrototype || valuePrototype === Object.prototype)
                    && Object.values(value).every((propertyValue) => exports.object.isSerializable(propertyValue));

            case "undefined":
            case "number":
            case "boolean":
            case "string":
                return true;

            case "symbol":
            case "function":
            default:
                return false;
        }
    },

    /**
     * Make an object as serializable forcely. 
     * @param {*} value The value to mark as serializable.
     * @param {boolean} [serializable=true] The flag to indicate whether to make as serializable or non-serializable.
     * @returns {*} The value marked.
     */
    markSerializable(value, serializable) {
        if (!exports.isNullOrUndefined(value)) {
            if (exports.isFunction(value)) {
                throw new Error("Cannot mark function objects as serializable.");
            }

            if (exports.isSymbol(value)) {
                throw new Error("Cannot mark symbol objects as serializable.");
            }

            serializable = serializable === true;

            value[Symbol_Serializable] = serializable;
        }

        return value;
    },

    /**
     * Travel the object against the property path and return the value.
     * @template T
     * @param {*} target Target the object to travel.
     * @param {string} propertyPath The property path to travel along.
     * @param {T} defaultValue The default value to return if the value doesn't exist.
     * @returns {T} The value of the target property.
     */
    getPropertyValue(target, propertyPath, defaultValue = undefined) {
        if (!exports.isString(propertyPath) || exports.string.isEmptyOrWhitespace(propertyPath)) {
            throw new Error("Invalid propertyPath.");
        }

        if (exports.isNullOrUndefined(target)) {
            return defaultValue;
        }

        const propertyNames = propertyPath.split(".");
        let targetObj = target;

        for (const name of propertyNames) {
            if (targetObj === undefined || targetObj === null) {
                return defaultValue;
            } else {
                targetObj = targetObj[name];
            }
        }

        return targetObj;
    }
};

exports.array = {
    /**
     * Check if an array is null/undefined/empty.
     * @param {Array.<*>} value The array to check.
     * @returns {boolean} True if the array is null/undefined/empty. Otherwise, false.
     */
    isNullUndefinedOrEmpty(value) {
        return value === null || value === undefined || (Array.isArray(value) && value.length <= 0);
    }
}

exports.date = {
    /**
     * Format the current date.
     * @param {Date} date The data to format.
     * @param {string} format The date format.
     * @returns {string} The formatted date.
     */
    format(date, format) {
        return format
            // Year
            .replace("yyyy", date.getFullYear().toString().padStart(4, "0"))
            .replace("yy", date.getFullYear().toString().substr(2, 2))

            // Month
            .replace("MM", date.getMonth().toString().padStart(2, "0"))
            .replace("M", date.getMonth().toString())

            // Day of Month
            .replace("dd", date.getDate().toString().padStart(2, "0"))
            .replace("d", date.getDate().toString())

            // Hours
            .replace("HH", date.getHours().toString().padStart(2, "0"))
            .replace("H", date.getHours().toString())

            // Minutes
            .replace("mm", date.getMinutes().toString().padStart(2, "0"))
            .replace("m", date.getMinutes().toString())

            // Seconds
            .replace("ss", date.getSeconds().toString().padStart(2, "0"))
            .replace("s", date.getSeconds().toString())

            // Thousandths of Second
            .replace("fff", date.getMilliseconds().toString().padStart(3, "0"))
            .replace("ff", date.getMilliseconds().toString().padStart(2, "0"))
            .replace("f", date.getMilliseconds().toString());
    }
}

/**
 * @template T
 * Pick the either non-null/non-undefined value between value and defaultValue.
 * @param {T} value The actual value.
 * @param {T} defaultValue The default value if the value is null/undefined.
 * @returns {T} The non-null/non-undefined value between value and defaultValue.
 */
exports.pick = (value, defaultValue) => (value === undefined || value === null) ? defaultValue : value;

/**
 * 
 * @param {Error} error 
 * @param {Array.<NodeJS.CallSite>} structuredStackTrace 
 * @returns {*}
 */
function prepareStackTraceOverride(error, structuredStackTrace) {
    return structuredStackTrace;
}

/**
 * @returns {CallerInfo}
 */
exports.getCallerModuleInfo = () => {
    const previousPrepareStackTraceFn = Error.prepareStackTrace;

    try {
        Error.prepareStackTrace = prepareStackTraceOverride;

        /** @type {Array.<NodeJS.CallSite>} */
        //@ts-ignore
        const callStack = (new Error()).stack;

        /** @type {CallerInfo} */
        let directCallerInfo = undefined;

        for (let callStackIndex = 0; callStackIndex < callStack.length; callStackIndex++) {
            const stack = callStack[callStackIndex];
            const stackFileName = stack.getFileName();

            if (directCallerInfo === undefined) {
                if (stackFileName !== module.filename) {
                    directCallerInfo = {
                        fileName: stackFileName,
                        functionName: stack.getFunctionName(),
                        typeName: stack.getTypeName(),
                        lineNumber: stack.getLineNumber(),
                        columnNumber: stack.getColumnNumber()
                    };
                }
            } else if (stackFileName !== directCallerInfo.fileName) {
                return {
                    fileName: stackFileName,
                    functionName: stack.getFunctionName(),
                    typeName: stack.getTypeName(),
                    lineNumber: stack.getLineNumber(),
                    columnNumber: stack.getColumnNumber()
                };
            }
        }

        return directCallerInfo;
    } finally {
        Error.prepareStackTrace = previousPrepareStackTraceFn;
    }
}

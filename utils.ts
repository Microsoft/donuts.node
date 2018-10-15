//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import "./common";

namespace Symbols {
    export const Serializable = Symbol("serializable");
}

/**
 * Check if the object is null or undefined.
 * @param value The object to check
 * @returns True if the value is null or undefined. Otherwise, false.
 */
export function isNullOrUndefined(value: any): value is undefined | null {
    return value === undefined || value === null;
}

/**
 * Check if the value is a symbol.
 * @param value The value to check.
 * @returns True if the value is symbol. Otherwise, false.
 */
export function isSymbol(value: any): value is symbol {
    return typeof value === "symbol";
}

/**
 * Check if the value is string.
 * @param value The value to check.
 * @returns True if the value is a string. Otherwise, false.
 */
export function isString(value: any): value is string {
    return typeof value === "string" || value instanceof String;
}

/**
 * Check if the value is a function.
 * @param value The value to check.
 * @returns True if the value is a function. Otherwise, false.
 */
export function isFunction(value: any): value is Function {
    return typeof value === "function";
}

/**
 * Check if the value is an object.
 * @param value The object to check.
 * @returns True if the value is an object. Otherwise, false.
 */
export function isObject(value: any): value is object {
    return value !== null && typeof value === "object";
}

export namespace string {
    /**
     * Check if there is possiblity that the value is a string.
     * @param value The value to check.
     * @returns True if the value is null/undefined/string. Otherwise, false.
     */
    export function possibleString(value: any): value is string {
        return isNullOrUndefined(value) || isString(value);
    }

    /**
     * Check if the string value is empty.
     * @param value The value to check.
     * @returns True if the string value is empty. Othersise, false.
     */
    export function isEmpty(value: string): boolean {
        return value === "";
    }

    /**
     * Check if the string value is empty or whitespaces.
     * @param value The value to check.
     * @returns True if the string value is empty or whitespaces. Otherwise, false.
     */
    export function isEmptyOrWhitespace(value: string): boolean {
        return value.trim() === "";
    }

    function defaultStringifier(obj: any, padding?: number): string {
        padding = pick(padding, 0);

        if (obj === null) {
            return "null";
        } else if (obj === undefined) {
            return "undefined";
        } else {
            const objType = typeof obj;

            if ((objType !== "object")
                || (objType === "object"
                    && isFunction(obj.toString)
                    && obj.toString !== Object.prototype.toString)) {
                return obj.toString();
            } else {
                let str: string = `\n${"".padStart(padding)}{\n`;

                for (const propertyName of Object.getOwnPropertyNames(obj)) {
                    str += `${"".padStart(padding + 4)}${propertyName}: ${defaultStringifier(obj[propertyName], padding + 4)}\n`;
                }

                str += `${"".padStart(padding)}}`;

                return str;
            }
        }
    }

    /**
     * Form a string based on a given format string with the args and a customized stringifier function.
     * @param stringifier The function to stringify the value of an arg.
     * @param format The format string.
     * @param args The args to form the string format.
     * @returns The formated string.
     */
    export function formatEx(stringifier: (obj: any) => string, format: string, ...args: Array<any>): string {
        if (!isFunction(stringifier)) {
            throw new Error("stringifier must be a function.");
        }

        if (!isString(format)) {
            throw new Error("format must be a string");
        }

        if (!Array.isArray(args)) {
            throw new Error("args must be an array.");
        }

        if (args === null || args === undefined) {
            return format;
        }

        let matchIndex = -1;

        return format.replace(/(\{*)(\{(\d*)\})/gi, (substring, escapeChar: string, argIdentifier: string, argIndexStr: string) => {
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
    }

    /**
     * Form a string based on a given format string with the args.
     * @param format The format string.
     * @param args The args to form the string format.
     * @returns The formated string.
     */
    export function format(format: string, ...args: Array<any>): string {
        return formatEx(defaultStringifier, format, ...args);
    }
}

export namespace object {
    /**
     * Check if an object is empty or not. It also checks if the prototype chains are empty (pure empty).
     * @param value The target object to be checked. Error will be thrown if the value is null or undefined.
     * @returns True if the object is empty include the prototype chains are also empty. 
     * Otherwise, false.
     */
    export function isEmpty(value: object): boolean {
        if (isNullOrUndefined(value)) {
            throw new Error("value cannot be null/undefined.");
        }

        // @ts-ignore
        for (const key in value) {
            return false;
        }

        return true;
    }

    /**
     * Check if the value is serializable. 
     * @param value The value to be checked.
     * @return  True if the value is serializable for sure. Otherwise, false, 
     * which indicates the value cannot be serialized or cannot be determined whether it can be serialized or not.
     */
    export function isSerializable(value: any): boolean {
        const valueType = typeof value;

        switch (valueType) {
            case "object":
                if (value === null) {
                    return true;
                }

                if (Object.prototype.hasOwnProperty.call(value, Symbols.Serializable)) {
                    return value[Symbols.Serializable] === true;
                }

                if (isFunction(value["toJSON"])) {
                    return true;
                }

                if (Array.isArray(value)) {
                    return value.every((itemValue) => isSerializable(itemValue));
                }

                const valuePrototype = Object.getPrototypeOf(value);

                return (!valuePrototype || valuePrototype === Object.prototype)
                    && Object.values(value).every((propertyValue) => isSerializable(propertyValue));

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
    }

    /**
     * Make an object as serializable forcely. 
     * @param value The value to mark as serializable.
     * @param {boolean} [serializable=true] The flag to indicate whether to make as serializable or non-serializable.
     * @returns The value marked.
     */
    export function markSerializable(value: any, serializable?: boolean): any {
        if (!isNullOrUndefined(value)) {
            if (isFunction(value)) {
                throw new Error("Cannot mark function objects as serializable.");
            }

            if (isSymbol(value)) {
                throw new Error("Cannot mark symbol objects as serializable.");
            }

            serializable = serializable === true;

            value[Symbols.Serializable] = serializable;
        }

        return value;
    }
}

export namespace array {
    /**
     * Check if an array is null/undefined/empty.
     * @param value The array to check.
     * @returns True if the array is null/undefined/empty. Otherwise, false.
     */
    export function isNullUndefinedOrEmpty(value: Array<any>): boolean {
        return value === null || value === undefined || (Array.isArray(value) && value.length <= 0);
    }
}

export function pick<T>(arg: T, defaultValue: T): T {
    return (arg === undefined || arg === null) ? defaultValue : arg;
}

export interface ICallerInfo {
    fileName: string;
    functionName: string;
    typeName: string;
    lineNumber: number;
    columnNumber: number;
}

function prepareStackTraceOverride(error: Error, structuredStackTrace: Array<NodeJS.CallSite>): any {
    return structuredStackTrace;
}

export function getCallerInfo(): ICallerInfo {
    const previousPrepareStackTraceFn = Error.prepareStackTrace;

    try {
        Error.prepareStackTrace = prepareStackTraceOverride;

        const callStack: Array<NodeJS.CallSite> = <any>(new Error()).stack;
        let directCallerInfo: ICallerInfo = undefined;

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

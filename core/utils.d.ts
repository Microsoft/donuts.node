//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export type CallerInfo = {
    fileName: string;
    functionName: string;
    typeName: string;
    lineNumber: number;
    columnNumber: number;
};

declare export function isNullOrUndefined(value: any): value is undefined | null;
declare export function isSymbol(value: any): value is symbol;
declare export function isString(value: any): value is string;
declare export function isFunction(value: any): value is Function;
declare export function isObject(value: any): value is object;
declare export function isNumber(value: any): value is number;

declare export function pick<T>(value: T, defaultValue: T): T;

declare export function getCallerModuleInfo(): CallerInfo;

declare export namespace string {
    function possibleString(value: any): value is string | undefined | null;
    function isEmpty(value: string): boolean;
    function isEmptyOrWhitespace(value: string): boolean;
    function defaultStringifier(obj: any, padding: number): string;
    function stringifier(obj: any): string;
    function formatEx(stringifier: (obj: any) => string, format: string, ...args: Array<any>): string;
    function format(format: string, ...args: Array<any>): string;
}

declare export namespace object {
    function isEmpty(value: object): boolean;
    function isSerializable(value: any): boolean;
    function markSerializable<T>(value: T, serializable: boolean = true): T;
    function getPropertyValue<T>(target: any, propertyPath: string, defaultValue: T = undefined): T;
}

declare export namespace array {
    function isNullUndefinedOrEmpty<T>(value: Array<T>): boolean;
}

declare export namespace date {
    function format(date: Date, format: string): string;
}
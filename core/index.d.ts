//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/// <reference path="./types.common.d.ts" />
/// <reference path="./types.di.d.ts" />
/// <reference path="./logging/types.logging.d.ts" />

declare module "donuts.node" {
    /**
     * Sleep for given time.
     * @param ms time in milliseconds.
     */
    declare export function sleepAsync(ms: number): Promise<void>;
}

declare module "donuts.node/di.ext" {
    export function dedication<T>(typeDescriptor: (...args: Array<any>) => any, injects: Array<string>): Donuts.DI.IDiDescriptor<T>;

    export function singleton<T>(instance: any): Donuts.DI.IDiDescriptor<T>;
}

declare module "donuts.node/di" {
    export class DiDescriptorDictionary implements Donuts.DI.IDiDescriptorDictionary {
        constructor();

        public get<T>(name: stirng): Donuts.DI.IDiDescriptor<T>;
        public set(name: string, descriptor: Donuts.DI.IDiDescriptor<any>): this;
    }

    export class DiContainer implements Donuts.DI.IDiContainer {
        constructor(dictionary?: Donuts.DI.IDiDescriptorDictionary);

        public getDep<T>(name: string, ...extraArgs: Array<any>): T;
        public get<T>(name: string): Donuts.DI.IDiDescriptor<T>;
        public set(name: string, descriptor: Donuts.DI.IDiDescriptor<any>): this;
    }
}

declare module "donuts.node/fileSystem" {
    import { PathLike, MakeDirectoryOptions, Stats, Dirent } from "fs";

    export function existsSync(path: PathLike): boolean;
    export function createDirectorySync(dirname: string): void;
    export function removeFileSync(target: string): void;
    export function removeDirectorySync(target: string): void;
    export function copyDirectorySync(srcDir: string, destDir: string): void;

    export function mkdirAsync(path: PathLike, mode?: string | number | MakeDirectoryOptions): Promise<void>;
    export function rmdirAsync(path: PathLike): Promise<void>;
    export function readdirAsync(path: PathLike, options?: { encoding: BufferEncoding | null; withFileTypes?: false } | BufferEncoding | null): Promise<string[]>;
    export function readdirAsync(path: PathLike, options: "buffer" | { encoding: "buffer"; withFileTypes?: false }): Promise<Buffer[]>;
    export function readdirAsync(path: PathLike, options?: { encoding?: string | null; withFileTypes?: false } | string | null): Promise<string[] | Buffer[]>;
    export function readdirAsync(path: PathLike, options: { withFileTypes: true }): Promise<Dirent[]>;
    export function statAsync(path: PathLike): Promise<Stats>;
    export function lstatAsync(path: PathLike): Promise<Stats>;
    export function unlinkAsync(path: PathLike): Promise<void>;
    export function existsAsync(path: PathLike): Promise<boolean>;
    export function copyFileAsync(src: PathLike, dst: PathLike, flags?: number): Promise<void>;
    export function accessAsync(path: PathLike, mode?: number): Promise<void>;

    export function copyDirectoryAsync(srcDir: string, destDir: string): Promise<void>;
    export function createDirectoryAsync(dirname: string): Promise<void>;
    export function removeDirectoryAsync(target: string): Promise<void>;
    export function removeFileAsync(target: string): Promise<void>;
}

declare module "donuts.node/path" {
    export function resolve(pathObject: string | import("./path").IPathObject, fromAppDir: boolean = false): string;

    export function local(target: string, fromAppDir: boolean = false): string;
}

declare module "donuts.node/shell" {
    import { IPVersion, TransportProtocol } from "./shell";
    import { ChildProcess } from "child_process";

    export function startAsync(filePath: string): Promise<string>;
    export function start(filePath: string): string;

    export function getUsedPorts(ipversion: IPVersion, protocol: TransportProtocol): Array<number>;
    export function getRandomPort(ipversion: IPVersion, protocol: TransportProtocol): number;

    export function toCmdArg(argName: string, argValue: string): string;
    export function toCmdArgs(argDict: Donuts.IDictionary<string, string>): string;
    export function toArgDict(args: Array<string>): Donuts.IDictionary<string, string>;
    export function getCmdArg(argName: string): string;

    export function fork(modulePath: string, forkArgs: Array<string>): ChildProcess;

    export function getAppDir(): string;
    export function getAppDataDir(): string;
    export function getDir(dirName: string): string;
}

declare module "donuts.node/utils" {
    import { CallerInfo } from "./utils";

    export function isNullOrUndefined(value: any): value is undefined | null;
    export function isSymbol(value: any): value is symbol;
    export function isString(value: any): value is string;
    export function isFunction(value: any): value is Function;
    export function isObject(value: any): value is object;
    export function isNumber(value: any): value is number;

    export function pick<T>(value: T, defaultValue: T): T;

    export function getCallerModuleInfo(): CallerInfo;

    export namespace string {
        function possibleString(value: any): value is string | undefined | null;
        function isEmpty(value: string): boolean;
        function isEmptyOrWhitespace(value: string): boolean;
        function defaultStringifier(obj: any, padding: number): string;
        function stringifier(obj: any): string;
        function formatEx(stringifier: (obj: any) => string, format: string, ...args: Array<any>): string;
        function format(format: string, ...args: Array<any>): string;
    }

    export namespace object {
        function isEmpty(value: object): boolean;
        function isSerializable(value: any): boolean;
        function markSerializable<T>(value: T, serializable: boolean = true): T;
        function getPropertyValue<T>(target: any, propertyPath: string, defaultValue: T = undefined): T;
    }

    export namespace array {
        function isNullUndefinedOrEmpty<T>(value: Array<T>): boolean;
    }

    export namespace date {
        function format(date: Date, format: string): string;
    }
}

declare module "donuts.node/logging" {
    export function getLog(): Donuts.Logging.ILog;
    export function setLog(log: Donuts.Logging.ILog): void;

    export function writeMoreAsync(properties: Donuts.IDictionary<string, string>, severity: Donuts.Logging.Severity, messageOrFormat: string, ...params: Array<any>): Promise<void>;
    export function writeAsync(severity: Donuts.Logging.Severity, messageOrFormat: string, ...params: Array<any>): Promise<void>;
    export function writeInfoAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
    export function writeVerboseAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
    export function writeWarningAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
    export function writeErrorAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
    export function writeCriticalAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
    export function writeExceptionAsync(exception: Error, properties?: Donuts.IDictionary<string, string>): Promise<void>;
    export function writeEventAsync(name: string, properties?: Donuts.IDictionary<string, string>): Promise<void>;
    export function writeMetricAsync(name: string, value?: number, properties?: Donuts.IDictionary<string, string>): Promise<void>;

    export function removeLoggerAsync(name: string): Promise<Donuts.Logging.ILogger>;
    export function addLoggerAsync(logger: Donuts.Logging.ILogger): Promise<void>;
}

declare module "donuts.node/logging/log" {
    export class Log implements Donuts.Logging.ILog {
        public static get instance(): Donuts.Logging.ILog;

        constructor(includeCallerInfo: boolean, defaultProperties: Donuts.IDictionary<string, any>);

        public writeMoreAsync(properties: Donuts.IDictionary<string, string>, severity: Donuts.Logging.Severity, messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeAsync(severity: Donuts.Logging.Severity, messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeInfoAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeVerboseAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeWarningAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeErrorAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeCriticalAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeExceptionAsync(exception: Error, properties?: Donuts.IDictionary<string, string>): Promise<void>;
        public writeEventAsync(name: string, properties?: Donuts.IDictionary<string, string>): Promise<void>;
        public writeMetricAsync(name: string, value?: number, properties?: Donuts.IDictionary<string, string>): Promise<void>;

        public removeLoggerAsync(name: string): Promise<Donuts.Logging.ILogger>;
        public addLoggerAsync(logger: Donuts.Logging.ILogger): Promise<void>;
    }
} 

declare module "donuts.node/logging/loggers/console" {
    import { IConsoleLoggerSettings } from "./logging/loggers/console";

    export class ConsoleLogger implements Donuts.Logging.ILogger {
        constructor(settings: IConsoleLoggerSettings, targetConsole: Console);

        public writeMoreAsync(properties: Donuts.IDictionary<string, string>, severity: Donuts.Logging.Severity, messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeAsync(severity: Donuts.Logging.Severity, messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeInfoAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeVerboseAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeWarningAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeErrorAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeCriticalAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
        public writeExceptionAsync(exception: Error, properties?: Donuts.IDictionary<string, string>): Promise<void>;
        public writeEventAsync(name: string, properties?: Donuts.IDictionary<string, string>): Promise<void>;
        public writeMetricAsync(name: string, value?: number, properties?: Donuts.IDictionary<string, string>): Promise<void>;

        public removeLoggerAsync(name: string): Promise<Donuts.Logging.ILogger>;
        public addLoggerAsync(logger: Donuts.Logging.ILogger): Promise<void>;
    }
} 
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IDictionary } from "../common";
import { Log } from "./log";

export enum Severity {
    Event = "event",
    Verbose = "verbose",
    Information = "info",
    Warning = "warning",
    Error = "error",
    Critical = "critical"
}

export interface ILoggerSettings extends IDictionary<any> {
    name: string;
    component: string;
}

export interface ILoggingSettings {
    logCallerInfo?: boolean;
    loggers?: Array<ILoggerSettings>;
    properties?: IDictionary<string>;
}

export interface ILogger {
    readonly name: string;

    writeAsync(properties: IDictionary<string>, severity: Severity, message: string): Promise<void>;
    writeExceptionAsync(properties: IDictionary<string>, error: Error): Promise<void>;
    writeMetricAsync(properties: IDictionary<string>, name: string, value: number): Promise<void>;
}

export interface ILog {
    writeMoreAsync(properties: IDictionary<string>, severity: Severity, messageOrFormat: string, ...params: Array<any>): Promise<void>;
    writeAsync(severity: Severity, messageOrFormat: string, ...params: Array<any>): Promise<void>;
    writeInfoAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
    writeVerboseAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
    writeWarningAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
    writeErrorAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
    writeCriticalAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
    writeExceptionAsync(exception: Error, properties?: IDictionary<string>): Promise<void>;
    writeEventAsync(name: string, properties?: IDictionary<string>): Promise<void>;
    writeMetricAsync(name: string, value?: number, properties?: IDictionary<string>): Promise<void>;

    removeLoggerAsync(name: string): Promise<ILogger>;
    addLoggerAsync(logger: ILogger): Promise<void>;
}

let defaultLog: ILog;

/**
 * Get the default log object.
 * @returns The default ILog object.
 */
export function getLog(): ILog {
    if (!defaultLog) {
        defaultLog = Log.instance;
    }

    return defaultLog;
}

/**
 * Set the default log object.
 * @param log The new default ILog object.
 */
export function setLog(log: ILog): void {
    defaultLog = log;
}

export function writeMoreAsync(properties: IDictionary<string>, severity: Severity, messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return defaultLog.writeMoreAsync(properties, severity, messageOrFormat, ...params);
}

export function writeAsync(severity: Severity, messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return defaultLog.writeAsync(severity, messageOrFormat, ...params);
}

export function writeInfoAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return defaultLog.writeInfoAsync(messageOrFormat, ...params);
}

export function writeVerboseAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return defaultLog.writeVerboseAsync(messageOrFormat, ...params);
}

export function writeWarningAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return defaultLog.writeWarningAsync(messageOrFormat, ...params);
}

export function writeErrorAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return defaultLog.writeErrorAsync(messageOrFormat, ...params);
}

export function writeCriticalAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return defaultLog.writeCriticalAsync(messageOrFormat, ...params);
}

export function writeExceptionAsync(exception: Error, properties?: IDictionary<string>): Promise<void> {
    return defaultLog.writeExceptionAsync(exception, properties);
}

export function writeEventAsync(name: string, properties?: IDictionary<string>): Promise<void> {
    return defaultLog.writeEventAsync(name, properties);
}

export function writeMetricAsync(name: string, value?: number, properties?: IDictionary<string>): Promise<void> {
    return defaultLog.writeMetricAsync(name, value, properties);
}

export function removeLoggerAsync(name: string): Promise<ILogger> {
    return defaultLog.removeLoggerAsync(name);
}

export function addLoggerAsync(logger: ILogger): Promise<void> {
    return defaultLog.addLoggerAsync(logger);
}

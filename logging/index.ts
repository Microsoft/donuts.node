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

    write(properties: IDictionary<string>, severity: Severity, message: string): void;
    writeException(properties: IDictionary<string>, error: Error): void;
    writeMetric(properties: IDictionary<string>, name: string, value: number): void;
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

    writeMore(properties: IDictionary<string>, severity: Severity, messageOrFormat: string, ...params: Array<any>): void;
    write(severity: Severity, messageOrFormat: string, ...params: Array<any>): void;
    writeInfo(messageOrFormat: string, ...params: Array<any>): void;
    writeVerbose(messageOrFormat: string, ...params: Array<any>): void;
    writeWarning(messageOrFormat: string, ...params: Array<any>): void;
    writeError(messageOrFormat: string, ...params: Array<any>): void;
    writeCritical(messageOrFormat: string, ...params: Array<any>): void;
    writeException(exception: Error, properties?: IDictionary<string>): void;
    writeEvent(name: string, properties?: IDictionary<string>): void;
    writeMetric(name: string, value?: number, properties?: IDictionary<string>): void;

    removeLoggerAsync(name: string): Promise<ILogger>;
    addLoggerAsync(logger: ILogger): Promise<void>;

    removeLogger(name: string): ILogger;
    addLogger(logger: ILogger): void;
}

export function getDefaultLog(): ILog {
    return Log.default;
}

export function setDefaultLog(log: ILog): void {
    Log.default = log;
}

export function writeMoreAsync(properties: IDictionary<string>, severity: Severity, messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return Log.default.writeMoreAsync(properties, severity, messageOrFormat, ...params);
}

export function writeAsync(severity: Severity, messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return Log.default.writeAsync(severity, messageOrFormat, ...params);
}

export function writeInfoAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return Log.default.writeInfoAsync(messageOrFormat, ...params);
}

export function writeVerboseAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return Log.default.writeVerboseAsync(messageOrFormat, ...params);
}

export function writeWarningAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return Log.default.writeWarningAsync(messageOrFormat, ...params);
}

export function writeErrorAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return Log.default.writeErrorAsync(messageOrFormat, ...params);
}

export function writeCriticalAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
    return Log.default.writeCriticalAsync(messageOrFormat, ...params);
}

export function writeExceptionAsync(exception: Error, properties?: IDictionary<string>): Promise<void> {
    return Log.default.writeExceptionAsync(exception, properties);
}

export function writeEventAsync(name: string, properties?: IDictionary<string>): Promise<void> {
    return Log.default.writeEventAsync(name, properties);
}

export function writeMetricAsync(name: string, value?: number, properties?: IDictionary<string>): Promise<void> {
    return Log.default.writeMetricAsync(name, value, properties);
}

export function writeMore(properties: IDictionary<string>, severity: Severity, messageOrFormat: string, ...params: Array<any>): void {
    return Log.default.writeMore(properties, severity, messageOrFormat);
}

export function write(severity: Severity, messageOrFormat: string, ...params: Array<any>): void {
    Log.default.write(severity, messageOrFormat, ...params);
}

export function writeInfo(messageOrFormat: string, ...params: Array<any>): void {
    Log.default.writeInfo(messageOrFormat, ...params);
}

export function writeVerbose(messageOrFormat: string, ...params: Array<any>): void {
    Log.default.writeVerbose(messageOrFormat, ...params);
}

export function writeWarning(messageOrFormat: string, ...params: Array<any>): void {
    Log.default.writeWarning(messageOrFormat, ...params);
}

export function writeError(messageOrFormat: string, ...params: Array<any>): void {
    Log.default.writeError(messageOrFormat, ...params);
}

export function writeCritical(messageOrFormat: string, ...params: Array<any>): void {
    Log.default.writeCritical(messageOrFormat, ...params);
}

export function writeException(exception: Error, properties?: IDictionary<string>): void {
    Log.default.writeException(exception, properties);
}

export function writeEvent(name: string, properties?: IDictionary<string>): void {
    Log.default.writeEvent(name, properties);
}

export function writeMetric(name: string, value?: number, properties?: IDictionary<string>): void {
    Log.default.writeMetric(name, value, properties);
}

export function removeLoggerAsync(name: string): Promise<ILogger> {
    return Log.default.removeLoggerAsync(name);
}

export function addLoggerAsync(logger: ILogger): Promise<void> {
    return Log.default.addLoggerAsync(logger);
}

export function removeLogger(name: string): ILogger {
    return Log.default.removeLogger(name);
}

export function addLogger(logger: ILogger): void {
    Log.default.addLogger(logger);
}

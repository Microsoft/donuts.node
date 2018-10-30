//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare namespace Logging {
    declare type Severity = "event" | "verbose" | "info" | "warning" | "error" | "critical";

    declare interface ILoggerSettings extends IDictionary<any> {
        name: string;
        component: string;
    }

    declare interface ILoggingSettings {
        logCallerInfo?: boolean;
        loggers?: Array<ILoggerSettings>;
        properties?: IDictionary<string>;
    }

    declare interface ILogger {
        readonly name: string;

        writeAsync(properties: IDictionary<string>, severity: Severity, message: string): Promise<void>;
        writeExceptionAsync(properties: IDictionary<string>, error: Error): Promise<void>;
        writeMetricAsync(properties: IDictionary<string>, name: string, value: number): Promise<void>;
    }

    declare interface ILog {
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
}


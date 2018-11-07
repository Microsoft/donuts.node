//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts.Logging {
    type Severity = "event" | "verbose" | "info" | "warning" | "error" | "critical";

    interface ILoggerSettings {
        [key: string]: any;
    }

    interface ILoggingSettings {
        logCallerInfo?: boolean;
        loggers?: Array<ILoggerSettings>;
        properties?: Donuts.IDictionary<string, string>;
    }

    interface ILogger {
        writeAsync(properties: Donuts.IDictionary<string, string>, severity: Severity, message: string): Promise<this>;
        writeExceptionAsync(properties: Donuts.IDictionary<string, string>, error: Error): Promise<this>;
        writeMetricAsync(properties: Donuts.IDictionary<string, string>, name: string, value: number): Promise<this>;
    }

    interface ILog {
        writeMoreAsync(properties: Donuts.IDictionary<string, string>, severity: Severity, messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeAsync(severity: Severity, messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeInfoAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeVerboseAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeWarningAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeErrorAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeCriticalAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeExceptionAsync(exception: Error, properties?: Donuts.IDictionary<string, string>): Promise<this>;
        writeEventAsync(name: string, properties?: Donuts.IDictionary<string, string>): Promise<this>;
        writeMetricAsync(name: string, value?: number, properties?: Donuts.IDictionary<string, string>): Promise<this>;

        removeLoggerAsync(name: string): Promise<this>;
        getLoggerAsync(name: string): Promise<ILogger>;
        addLoggerAsync(name: string, logger: ILogger): Promise<this>;
    }
}


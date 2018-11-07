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
        properties?: Donuts.IStringKeyDictionary<string>;
    }

    interface ILogger {
        writeAsync(properties: Donuts.IStringKeyDictionary<string>, severity: Severity, message: string): Promise<this>;
        writeExceptionAsync(properties: Donuts.IStringKeyDictionary<string>, error: Error): Promise<this>;
        writeMetricAsync(properties: Donuts.IStringKeyDictionary<string>, name: string, value: number): Promise<this>;
    }

    interface ILog {
        writeMoreAsync(properties: Donuts.IStringKeyDictionary<string>, severity: Severity, messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeAsync(severity: Severity, messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeInfoAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeVerboseAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeWarningAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeErrorAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeCriticalAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
        writeExceptionAsync(exception: Error, properties?: Donuts.IStringKeyDictionary<string>): Promise<this>;
        writeEventAsync(name: string, properties?: Donuts.IStringKeyDictionary<string>): Promise<this>;
        writeMetricAsync(name: string, value?: number, properties?: Donuts.IStringKeyDictionary<string>): Promise<this>;

        removeLoggerAsync(name: string): Promise<this>;
        getLoggerAsync(name: string): Promise<ILogger>;
        addLoggerAsync(name: string, logger: ILogger): Promise<this>;
    }
}


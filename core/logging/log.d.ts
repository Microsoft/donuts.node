//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export class Log implements Donuts.Logging.ILog {
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
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export class Log implements Donuts.Logging.ILog {
    public static get instance(): Donuts.Logging.ILog;

    constructor(includeCallerInfo: boolean, defaultProperties: Donuts.IStringKeyDictionary<any>);

    public writeMoreAsync(properties: Donuts.IStringKeyDictionary<string>, severity: Donuts.Logging.Severity, messageOrFormat: string, ...params: Array<any>): Promise<this>;
    public writeAsync(severity: Donuts.Logging.Severity, messageOrFormat: string, ...params: Array<any>): Promise<this>;
    public writeInfoAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
    public writeVerboseAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
    public writeWarningAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
    public writeErrorAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
    public writeCriticalAsync(messageOrFormat: string, ...params: Array<any>): Promise<this>;
    public writeExceptionAsync(exception: Error, properties?: Donuts.IStringKeyDictionary<string>): Promise<this>;
    public writeEventAsync(name: string, properties?: Donuts.IStringKeyDictionary<string>): Promise<this>;
    public writeMetricAsync(name: string, value?: number, properties?: Donuts.IStringKeyDictionary<string>): Promise<this>;

    public removeLoggerAsync(name: string): Promise<this>;
    public addLoggerAsync(logger: Donuts.Logging.ILogger): Promise<this>;
    public getLoggerAsync(name: string): Promise<ILogger>;
}
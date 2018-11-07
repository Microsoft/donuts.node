//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export interface IConsoleLoggerSettings extends Donuts.Logging.ILoggerSettings {
    logAllProperties?: boolean;
    logCallerInfo?: boolean;
}

declare export class ConsoleLogger implements Donuts.Logging.ILogger {
    constructor(settings?: IConsoleLoggerSettings, targetConsole?: Console);

    public writeAsync(properties: Donuts.IDictionary<string, string>, severity: Severity, message: string): Promise<this>;
    public writeExceptionAsync(properties: Donuts.IDictionary<string, string>, error: Error): Promise<this>;
    public writeMetricAsync(properties: Donuts.IDictionary<string, string>, name: string, value: number): Promise<this>;
}
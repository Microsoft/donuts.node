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

    public writeAsync(properties: Donuts.IStringKeyDictionary<string>, severity: Severity, message: string): Promise<this>;
    public writeExceptionAsync(properties: Donuts.IStringKeyDictionary<string>, error: Error): Promise<this>;
    public writeMetricAsync(properties: Donuts.IStringKeyDictionary<string>, name: string, value: number): Promise<this>;
}
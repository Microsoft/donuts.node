//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export function getLog(): Donuts.Logging.ILog;
declare export function setLog(log: Donuts.Logging.ILog): void;

declare export function writeMoreAsync(properties: Donuts.IDictionary<string, string>, severity: Donuts.Logging.Severity, messageOrFormat: string, ...params: Array<any>): Promise<void>;
declare export function writeAsync(severity: Donuts.Logging.Severity, messageOrFormat: string, ...params: Array<any>): Promise<void>;
declare export function writeInfoAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
declare export function writeVerboseAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
declare export function writeWarningAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
declare export function writeErrorAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
declare export function writeCriticalAsync(messageOrFormat: string, ...params: Array<any>): Promise<void>;
declare export function writeExceptionAsync(exception: Error, properties?: Donuts.IDictionary<string, string>): Promise<void>;
declare export function writeEventAsync(name: string, properties?: Donuts.IDictionary<string, string>): Promise<void>;
declare export function writeMetricAsync(name: string, value?: number, properties?: Donuts.IDictionary<string, string>): Promise<void>;

declare export function removeLoggerAsync(name: string): Promise<Donuts.Logging.ILogger>;
declare export function addLoggerAsync(logger: Donuts.Logging.ILogger): Promise<void>;
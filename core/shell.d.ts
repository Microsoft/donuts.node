//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IPVersion, TransportProtocol } from "./shell";
import { ChildProcess } from "child_process";

declare export function startAsync(filePath: string): Promise<string>;
declare export function start(filePath: string): string;

declare export function getUsedPorts(ipversion: IPVersion, protocol: TransportProtocol): Array<number>;
declare export function getRandomPort(ipversion: IPVersion, protocol: TransportProtocol): number;

declare export function toCmdArg(argName: string, argValue: string): string;
declare export function toCmdArgs(argDict: Donuts.IDictionary<string, string>): Array<string>;
declare export function toArgDict(args: Array<string>): Donuts.IDictionary<string, string>;
declare export function getCmdArg(argName: string): string;

declare export function fork(modulePath: string, forkArgs: Array<string>): ChildProcess;

declare export function getAppDir(): string;
declare export function getAppDataDir(): string;
declare export function getDir(dirName: string): string;
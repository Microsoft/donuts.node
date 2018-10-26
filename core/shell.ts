//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IDictionary } from ".";

import * as cp from "child_process";
import * as path from "path";
import * as util from "util";
import * as fs from "fs";

import * as utils from "./utils";

export type IPVersion = "IPv4" | "IPv6";
export type TransportProtocol = "TCP" | "UDP";

const execAsync = util.promisify(cp.exec);
const Symbol_CmdArgs = Symbol("CmdArgs");

function generateFileStartCmd(filePath: string): string {
    const escape = (str: string) => str.replace(/"/g, '\\\"');

    if (!path) {
        throw new Error("path must be specified!");
    }

    switch (process.platform) {
        case "win32":
            return `start "${path.basename(filePath)}" "${escape(filePath)}"`;

        case "darwin":
            return `open "${escape(filePath)}"`;

        case "linux":
        default:
            return `xdg-open "${escape(filePath)}"`;
    }
}

export function startAsync(filepath: string): Promise<string> {
    return execAsync(generateFileStartCmd(filepath))
        .then((result) => {
            const results: Array<string> = [];

            if (result.stdout) {
                results.push(result.stdout);
            }

            if (result.stderr) {
                results.push(result.stderr);
            }

            return results.join("\r\n");
        });
}

export function start(filepath: string): string {
    return cp.execSync(generateFileStartCmd(filepath), { encoding: "utf8" });
}

function getUsedPortsOnLinux(ipversion: IPVersion, protocol: TransportProtocol): Array<number> {
    let ipversionNum: number;

    if (ipversion === "IPv4") {
        ipversionNum = 4;

    } else if (ipversion === "IPv6") {
        ipversionNum = 6;

    } else {
        throw new Error(`Not supported IP version: ${ipversion}`);
    }

    const PortRegex = new RegExp(`${protocol}\s+((\d+\.\d+\.\d+\.\d+)|\*\:(\d+))`, "ig");
    const lsof = cp.execSync(`lsof -i${ipversionNum}${protocol} -s${protocol}:LISTEN`, { encoding: "utf8" });

    let portMatch: RegExpExecArray;
    const ports: Array<number> = [];

    while (portMatch = PortRegex.exec(lsof)) {
        ports.push(parseInt(portMatch[3], 10));
    }

    return ports;
}

function getUsedPortsOnWin32(ipversion: IPVersion, protocol: TransportProtocol): Array<number> {
    let protocolName: string;

    if (ipversion === "IPv4") {
        protocolName = `${protocol}v4`;

    } else if (ipversion === "IPv6") {
        protocolName = `${protocol}v6`;

    } else {
        throw new Error(`Not supported IP version: ${ipversion}`);
    }

    const PortRegex = new RegExp(`${protocol}\s+(\d+\.\d+\.\d+\.\d+\:(\d+))`, "ig");
    const netstat = cp.execSync(`netstat -a -n -p ${protocolName}`, { encoding: "utf8" });

    let portMatch: RegExpExecArray;
    const ports: Array<number> = [];

    while (portMatch = PortRegex.exec(netstat)) {
        ports.push(parseInt(portMatch[2], 10));
    }

    return ports;
}

export function getUsedPorts(ipversion: IPVersion = "IPv4", protocol: TransportProtocol = "TCP"): Array<number> {
    if (ipversion !== "IPv4" && ipversion !== "IPv6") {
        throw new Error(`Not supported IP version: ${ipversion}`);
    }

    if (protocol !== "TCP" && protocol !== "UDP") {
        throw new Error(`Not supported protocol: ${protocol}`);
    }

    switch (process.platform) {
        case "win32":
            return getUsedPortsOnWin32(ipversion, protocol);

        case "darwin":
        case "linux":
            return getUsedPortsOnLinux(ipversion, protocol);

        default:
            throw new Error(`Unsupport platform: ${process.platform}`);
    }
}

export function getRandomPort(ipversion: IPVersion = "IPv4", protocol: TransportProtocol = "TCP"): number {
    const usedPorts = getUsedPorts(ipversion, protocol);
    let port = 0;

    do {
        port = Math.floor(Math.random() * 63535) + 2000;
    } while (port <= 0 || usedPorts.includes(port));

    return port;
}

export function toCmdArg(argName: string, argValue: string): string {
    return `--${argName}=${argValue}`;
}

export function toCmdArgs(argDict: IDictionary<string>): Array<string> {
    if (!utils.isNullOrUndefined(argDict)
        && (!utils.isObject(argDict) || Array.isArray(argDict))) {
        throw new Error("argDict must be an IDictionary<string>.");
    }

    const args: Array<string> = [];

    for (const key in argDict) {
        args.push(toCmdArg(key, argDict[key]));
    }

    return args;
}

export function toArgDict(args: Array<string>): IDictionary<string> {
    if (!Array.isArray(args)) {
        throw new Error("args must be an array of string.");
    }

    const argDict: IDictionary<string> = Object.create(null);
    const CmdArgParseFormat = /^\s*\-\-([a-zA-Z0-9_\-+@]+)\=?(.*)$/g;

    for (const arg of args) {
        let matchResult: RegExpExecArray;

        while (matchResult = CmdArgParseFormat.exec(arg)) {
            argDict[matchResult[1]] = matchResult[2];
        }
    }

    return argDict;
}

export function getCmdArg(argName: string): string {
    if (!process[Symbol_CmdArgs]) {
        process[Symbol_CmdArgs] = toArgDict(process.argv);
    }

    return process[Symbol_CmdArgs][argName];
}

function getInspectArg(): string {
    const inspectArg = getCmdArg("inspect-brk");

    if (!inspectArg) {
        return undefined;
    }

    return `--inspect-brk=${getRandomPort()}`;
}

export function getAppDir(): string {
    return getCmdArg("appDir") || getCmdArg("app-path") || path.dirname(require.main.filename);
}

function formEssentialForkArgs(): Array<string> {
    return [`--appDir=${getAppDir()}`];
}

export function fork(modulePath: string, forkArgs?: Array<string>): cp.ChildProcess {
    if (!utils.isString(modulePath) || utils.string.isEmptyOrWhitespace(modulePath)) {
        throw new Error("modulePath must be provided.");
    }

    if (!fs.existsSync(modulePath)) {
        throw new Error("modulePath is pointing to non-exists location.");
    }

    if (!utils.isNullOrUndefined(forkArgs) && !Array.isArray(forkArgs)) {
        throw new Error("forkArgs must be an array of string.");
    }

    const args: Array<string> = formEssentialForkArgs();

    if (Array.isArray(process.argv)) {
        let arg: string = getInspectArg();

        if (arg) {
            args.push(arg);
        }
    }

    if (forkArgs) {
        args.push(...forkArgs);
    }

    return cp.fork(modulePath, args);
}

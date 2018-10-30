//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const cp = require("child_process");
const path = require("path");
const util = require("util");
const fs = require("fs");
const utils = require("./utils");

/**
 * @typedef {"IPv4" | "IPv6"} IPVersion
 */

/**
 * @typedef {"TCP" | "UDP"} TransportProtocol
 */

const execAsync = util.promisify(cp.exec);
const Symbol_CmdArgs = Symbol("CmdArgs");

/**
 * 
 * @param {string} filePath 
 * @returns {string}
 */
function generateFileStartCmd(filePath) {
    /**
     * 
     * @param {string} str 
     * @returns {string}
     */
    const escape = (str) => str.replace(/"/g, '\\\"');

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

/**
 * 
 * @param {string} filepath 
 * @returns {Promise<string>}
 */
exports.startAsync = (filepath) => {
    return execAsync(generateFileStartCmd(filepath))
        .then((result) => {
            /** @type {Array.<string>} */
            const results = [];

            if (result.stdout) {
                results.push(result.stdout);
            }

            if (result.stderr) {
                results.push(result.stderr);
            }

            return results.join("\r\n");
        });
}

/**
 * Open a file in shell.
 * @param {string} filepath 
 * @returns {string} The output of the execution of the file in shell.
 */
exports.start = (filepath) => cp.execSync(generateFileStartCmd(filepath), { encoding: "utf8" });

/**
 * 
 * @param {IPVersion} ipversion 
 * @param {TransportProtocol} protocol 
 * @returns {Array.<number>}
 */
function getUsedPortsOnLinux(ipversion, protocol) {
    /** @type {number} */
    let ipversionNum;

    if (ipversion === "IPv4") {
        ipversionNum = 4;

    } else if (ipversion === "IPv6") {
        ipversionNum = 6;

    } else {
        throw new Error(`Not supported IP version: ${ipversion}`);
    }

    const PortRegex = new RegExp(`${protocol}\s+((\d+\.\d+\.\d+\.\d+)|\*\:(\d+))`, "ig");
    const lsof = cp.execSync(`lsof -i${ipversionNum}${protocol} -s${protocol}:LISTEN`, { encoding: "utf8" });

    /** @type {RegExpExecArray} */
    let portMatch;

    /** @type {Array.<number>} */
    const ports = [];

    while (portMatch = PortRegex.exec(lsof)) {
        ports.push(parseInt(portMatch[3], 10));
    }

    return ports;
}

/**
 * 
 * @param {IPVersion} ipversion 
 * @param {TransportProtocol} protocol 
 * @returns {Array.<number>}
 */
function getUsedPortsOnWin32(ipversion, protocol) {
    /** @type {string} */
    let protocolName;

    if (ipversion === "IPv4") {
        protocolName = `${protocol}v4`;

    } else if (ipversion === "IPv6") {
        protocolName = `${protocol}v6`;

    } else {
        throw new Error(`Not supported IP version: ${ipversion}`);
    }

    const PortRegex = new RegExp(`${protocol}\s+(\d+\.\d+\.\d+\.\d+\:(\d+))`, "ig");
    const netstat = cp.execSync(`netstat -a -n -p ${protocolName}`, { encoding: "utf8" });

    /** @type {RegExpExecArray} */
    let portMatch;

    /** @type {Array.<number>} */
    const ports = [];

    while (portMatch = PortRegex.exec(netstat)) {
        ports.push(parseInt(portMatch[2], 10));
    }

    return ports;
}

/**
 * 
 * @param {IPVersion} [ipversion="IPv4"]
 * @param {TransportProtocol} [protocol="TCP"]
 * @returns {Array.<number>}
 */
exports.getUsedPorts = (ipversion, protocol) => {
    ipversion = ipversion || "IPv4";
    protocol = protocol || "TCP";

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

/**
 * @param {IPVersion} [ipversion="IPv4"]
 * @param {TransportProtocol} [protocol="TCP"]
 * @returns {number}
 */
exports.getRandomPort = (ipversion, protocol) => {
    const usedPorts = exports.getUsedPorts(ipversion, protocol);
    let port = 0;

    do {
        port = Math.floor(Math.random() * 63535) + 2000;
    } while (port <= 0 || usedPorts.includes(port));

    return port;
}

/**
 * 
 * @param {string} argName 
 * @param {string} argValue 
 * @returns {string}
 */
exports.toCmdArg = (argName, argValue) => `--${argName}=${argValue}`;

/**
 * @param {Donuts.IDictionary<string>} argDict
 * @returns {Array.<string>}
 */
exports.toCmdArgs = (argDict) => {
    if (!utils.isNullOrUndefined(argDict)
        && (!utils.isObject(argDict) || Array.isArray(argDict))) {
        throw new Error("argDict must be an IDictionary<string>.");
    }

    /** @type {Array.<string>} */
    const args = [];

    for (const key in argDict) {
        args.push(exports.toCmdArg(key, argDict[key]));
    }

    return args;
}

/**
 * 
 * @param {Array.<string>} args 
 * @returns {Donuts.IDictionary.<string>}
 */
exports.toArgDict = (args) => {
    if (!Array.isArray(args)) {
        throw new Error("args must be an array of string.");
    }

    /** @type {Donuts.IDictionary.<string>} */
    const argDict = Object.create(null);
    const CmdArgParseFormat = /^\s*\-\-([a-zA-Z0-9_\-+@]+)\=?(.*)$/g;

    for (const arg of args) {
        /** @type {RegExpExecArray} */
        let matchResult;

        while (matchResult = CmdArgParseFormat.exec(arg)) {
            argDict[matchResult[1]] = matchResult[2];
        }
    }

    return argDict;
}

/**
 * 
 * @param {string} argName 
 * @returns {string}
 */
exports.getCmdArg = (argName) => {
    //@ts-ignore
    if (!process[Symbol_CmdArgs]) {
        //@ts-ignore
        process[Symbol_CmdArgs] = toArgDict(process.argv);
    }

    //@ts-ignore
    return process[Symbol_CmdArgs][argName];
}

/**
 * @returns {string}
 */
function getInspectArg() {
    const inspectArg = exports.getCmdArg("inspect-brk");

    if (!inspectArg) {
        return undefined;
    }

    return `--inspect-brk=${exports.getRandomPort()}`;
}

/**
 * @returns {string}
 */
exports.getAppDir = () => exports.getCmdArg("appDir") || exports.getCmdArg("app-path") || path.dirname(require.main.filename);

/**
 * @returns {Array.<string>}
 */
function formEssentialForkArgs() {
    return [`--appDir=${exports.getAppDir()}`];
}

/**
 * 
 * @param {string} modulePath 
 * @param {Array.<string>} [forkArgs]
 * @returns {import("child_process").ChildProcess}
 */
exports.fork = (modulePath, forkArgs) => {
    if (!utils.isString(modulePath) || utils.string.isEmptyOrWhitespace(modulePath)) {
        throw new Error("modulePath must be provided.");
    }

    if (!fs.existsSync(modulePath)) {
        throw new Error("modulePath is pointing to non-exists location.");
    }

    if (!utils.isNullOrUndefined(forkArgs) && !Array.isArray(forkArgs)) {
        throw new Error("forkArgs must be an array of string.");
    }

    /** @type {Array.<string>} */
    const args = formEssentialForkArgs();

    if (Array.isArray(process.argv)) {
        /** @type {string} */
        let arg = getInspectArg();

        if (arg) {
            args.push(arg);
        }
    }

    if (forkArgs) {
        args.push(...forkArgs);
    }

    return cp.fork(modulePath, args);
}

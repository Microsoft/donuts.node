//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const util = require("util");
const path = require("path");
const fs = require("fs");
const utils = require("./utils");

/**
 * 
 * @param {string} dirname 
 */
exports.createDirectorySync = (dirname) => {
    if (!utils.isString(dirname)) {
        throw new Error("dir must be provided.");
    }

    const parts = dirname.includes("/") ? dirname.split("/") : dirname.split("\\");

    /** @type {string} */
    let currentDir = "";

    for (const part of parts) {
        currentDir =
            !currentDir ?
                // Windows: The first part should be "<driver>:".
                part :
                path.join(currentDir, part);

        // Linux: the first part is empty which indicates the root.
        if (!currentDir) {
            currentDir = "/";
        }

        if (!fs.existsSync(currentDir)) {
            fs.mkdirSync(currentDir);
        }

        const stat = fs.statSync(currentDir);

        if (!stat.isDirectory()) {
            throw new Error(`Path ${currentDir} is not a directory.`);
        }
    }
}

/**
 * 
 * @param {string} target 
 */
exports.removeFileSync = (target) => {
    if (!fs.existsSync(target)) {
        return;
    }

    const lstat = fs.lstatSync(target);

    if (!lstat.isFile() && !lstat.isSymbolicLink()) {
        return;
    }

    fs.unlinkSync(target);
}

/**
 * 
 * @param {string} target 
 */
exports.removeDirectorySync = (target) => {
    if (!fs.existsSync(target)
        || !fs.lstatSync(target).isDirectory()) {
        return;
    }

    /** @type {Array.<string>} */
    const dirs = [];

    /** @type {Array.<string>} */
    const entries = [target];

    while (entries.length > 0) {
        const entry = entries.pop();
        const entrylstat = fs.lstatSync(entry);

        if (entrylstat.isFile() || entrylstat.isSymbolicLink()) {
            exports.removeFileSync(entry);

        } else if (entrylstat.isDirectory()) {
            dirs.push(entry);
            entries.push(...fs.readdirSync(entry).map((value) => path.join(entry, value)));

        } else {
            throw new Error(`Unsupported target: ${entry}`);
        }
    }

    while (dirs.length > 0) {
        fs.rmdirSync(dirs.pop());
    }
}

/**
 * 
 * @param {string} srcDir 
 * @param {string} destDir 
 */
exports.copyDirectorySync = (srcDir, destDir) => {
    if (!utils.isString(srcDir)) {
        throw new Error("srcDir should be a string.");
    }

    if (!utils.isString(destDir)) {
        throw new Error("destDir should be a string.");
    }

    if (!fs.statSync(srcDir).isDirectory()) {
        throw new Error("srcDir must point to a directory.");
    }

    exports.createDirectorySync(destDir);

    /** @type {Array.<string>} */
    const entries = fs.readdirSync(srcDir);

    while (entries.length > 0) {
        const entry = entries.pop();
        const entryStat = fs.statSync(entry);

        if (entryStat.isFile()) {
            fs.copyFileSync(path.join(srcDir, entry), path.join(destDir, entry));

        } else if (entryStat.isDirectory()) {
            fs.mkdirSync(path.join(destDir, entry));
            entries.push(...fs.readdirSync(path.join(srcDir, entry)).map((value) => path.join(entry, value)));

        } else {
            throw new Error(`Unsupported target: ${entry}`);
        }
    }
}

exports.mkdirAsync = util.promisify(fs.mkdir);
exports.rmdirAsync = util.promisify(fs.rmdir);
exports.readdirAsync = util.promisify(fs.readdir);
exports.statAsync = util.promisify(fs.stat);
exports.lstatAsync = util.promisify(fs.lstat);
exports.unlinkAsync = util.promisify(fs.unlink);
exports.existsAsync = util.promisify(fs.exists);
exports.copyFileAsync = util.promisify(fs.copyFile);

/**
 * 
 * @param {string} srcDir 
 * @param {string} destDir 
 * @returns {Promise<void>}
 */
exports.copyDirectoryAsync = async (srcDir, destDir) => {
    if (!utils.isString(srcDir)) {
        throw new Error("srcDir should be a string.");
    }

    if (!utils.isString(destDir)) {
        throw new Error("destDir should be a string.");
    }

    if (!(await exports.statAsync(srcDir)).isDirectory()) {
        throw new Error("srcDir must point to a directory.");
    }

    await exports.createDirectoryAsync(destDir);

    /** @type {Array.<string>} */
    const entries = await exports.readdirAsync(srcDir);

    /** @type {Array.<Promise<void>>} */
    const promises = [];

    while (entries.length > 0) {
        const entry = entries.pop();
        const entryStat = await exports.statAsync(entry);

        if (entryStat.isFile()) {
            promises.push(exports.copyFileAsync(path.join(srcDir, entry), path.join(destDir, entry)));

        } else if (entryStat.isDirectory()) {
            await exports.mkdirAsync(path.join(destDir, entry));
            entries.push(...(await exports.readdirAsync(path.join(srcDir, entry))).map((value) => path.join(entry, value)));

        } else {
            throw new Error(`Unsupported target: ${entry}`);
        }
    }

    await Promise.all(promises);
}

/**
 * 
 * @param {string} dirname 
 * @returns {Promise<void>}
 */
exports.createDirectoryAsync = async (dirname) => {
    if (!utils.isString(dirname)) {
        throw new Error("dir must be provided.");
    }

    const parts = dirname.includes("/") ? dirname.split("/") : dirname.split("\\");

    /** @type {string} */
    let currentDir = "";

    for (const part of parts) {
        currentDir =
            !currentDir ?
                // Windows: The first part should be "<driver>:".
                part :
                path.join(currentDir, part);

        // Linux: the first part is empty which indicates the root.
        if (!currentDir) {
            currentDir = "/";
        }

        if (!(await exports.existsAsync(currentDir))) {
            await exports.mkdirAsync(currentDir);
        }

        const stat = await exports.statAsync(currentDir);

        if (!stat.isDirectory()) {
            throw new Error(`Path ${currentDir} is not a directory.`);
        }
    }
}

/**
 * 
 * @param {*} target 
 * @returns {Promise<void>}
 */
exports.removeDirectoryAsync = async (target) => {
    if (!(await exports.existsAsync(target))
        || !(await exports.lstatAsync(target)).isDirectory()) {
        return;
    }

    /** @type {Array.<string>} */
    const dirs = [];

    /** @type {Array.<string>} */
    const entries = [target];

    while (entries.length > 0) {
        const entry = entries.pop();
        const entrylstat = await exports.lstatAsync(entry);

        if (entrylstat.isFile() || entrylstat.isSymbolicLink()) {
            await exports.removeFileAsync(entry);

        } else if (entrylstat.isDirectory()) {
            dirs.push(entry);
            entries.push(...(await exports.readdirAsync(entry)).map((value) => path.join(entry, value)));

        } else {
            throw new Error(`Unsupported target: ${entry}`);
        }
    }

    while (dirs.length > 0) {
        await exports.rmdirAsync(dirs.pop());
    }
}

/**
 * 
 * @param {string} target 
 * @returns {Promise<void>}
 */
exports.removeFileAsync = async (target) => {
    if (!(await exports.existsAsync(target))) {
        return;
    }

    const lstat = await exports.lstatAsync(target);

    if (!lstat.isFile() && !lstat.isSymbolicLink()) {
        return;
    }

    await exports.unlinkAsync(target);
}

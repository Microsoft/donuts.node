//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as util from "util";
import * as path from "path";
import * as fs from "fs";

import * as utils from "./utils";

export function createDirectorySync(dirname: string): void {
    if (!utils.isString(dirname)) {
        throw new Error("dir must be provided.");
    }

    const parts = dirname.includes("/") ? dirname.split("/") : dirname.split("\\");
    let currentDir: string = "";

    for (const part of parts) {
        currentDir = path.join(currentDir, part);

        if (!fs.existsSync(currentDir)) {
            fs.mkdirSync(currentDir);
        }

        const stat = fs.statSync(currentDir);

        if (!stat.isDirectory()) {
            throw new Error(`Path ${currentDir} is not a directory.`);
        }
    }
}

export function removeFileSync(target: string): void {
    if (!fs.existsSync(target)) {
        return;
    }

    const lstat = fs.lstatSync(target);

    if (!lstat.isFile() && !lstat.isSymbolicLink()) {
        return;
    }

    fs.unlinkSync(target);
}

export function removeDirectorySync(target: string): void {
    if (!fs.existsSync(target)
        || !fs.lstatSync(target).isDirectory()) {
        return;
    }

    const dirs: Array<string> = [];
    const entries: string[] = [target];

    while (entries.length > 0) {
        const entry = entries.pop();
        const entrylstat = fs.lstatSync(entry);

        if (entrylstat.isFile() || entrylstat.isSymbolicLink()) {
            removeFileSync(entry);

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

export function copyDirectorySync(srcDir: string, destDir: string): void {
    if (!utils.isString(srcDir)) {
        throw new Error("srcDir should be a string.");
    }

    if (!utils.isString(destDir)) {
        throw new Error("destDir should be a string.");
    }

    if (!fs.statSync(srcDir).isDirectory()) {
        throw new Error("srcDir must point to a directory.");
    }

    createDirectorySync(destDir);

    const entries: string[] = fs.readdirSync(srcDir);

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

export const mkdirAsync = util.promisify(fs.mkdir);
export const rmdirAsync = util.promisify(fs.rmdir);
export const readdirAsync = util.promisify(fs.readdir);
export const statAsync = util.promisify(fs.stat);
export const lstatAsync = util.promisify(fs.lstat);
export const unlinkAsync = util.promisify(fs.unlink);
export const existsAsync = util.promisify(fs.exists);
export const copyFileAsync = util.promisify(fs.copyFile);

export async function copyDirectoryAsync(srcDir: string, destDir: string): Promise<void> {
    if (!utils.isString(srcDir)) {
        throw new Error("srcDir should be a string.");
    }

    if (!utils.isString(destDir)) {
        throw new Error("destDir should be a string.");
    }

    if (!(await statAsync(srcDir)).isDirectory()) {
        throw new Error("srcDir must point to a directory.");
    }

    await createDirectoryAsync(destDir);

    const entries: Array<string> = await readdirAsync(srcDir);
    const promises: Array<Promise<void>> = [];

    while (entries.length > 0) {
        const entry = entries.pop();
        const entryStat = await statAsync(entry);

        if (entryStat.isFile()) {
            promises.push(copyFileAsync(path.join(srcDir, entry), path.join(destDir, entry)));

        } else if (entryStat.isDirectory()) {
            await mkdirAsync(path.join(destDir, entry));
            entries.push(...(await readdirAsync(path.join(srcDir, entry))).map((value) => path.join(entry, value)));

        } else {
            throw new Error(`Unsupported target: ${entry}`);
        }
    }

    await Promise.all(promises);
}

export async function createDirectoryAsync(dirname: string): Promise<void> {
    if (!utils.isString(dirname)) {
        throw new Error("dir must be provided.");
    }

    const parts = dirname.includes("/") ? dirname.split("/") : dirname.split("\\");
    let currentDir: string = "";

    for (const part of parts) {
        currentDir = path.join(currentDir, part);

        if (!(await existsAsync(currentDir))) {
            await mkdirAsync(currentDir);
        }

        const stat = await statAsync(currentDir);

        if (!stat.isDirectory()) {
            throw new Error(`Path ${currentDir} is not a directory.`);
        }
    }
}

export async function removeDirectoryAsync(target: string): Promise<void> {
    if (!(await existsAsync(target))
        || !(await lstatAsync(target)).isDirectory()) {
        return;
    }

    const dirs: Array<string> = [];
    const entries: Array<string> = [target];

    while (entries.length > 0) {
        const entry = entries.pop();
        const entrylstat = await lstatAsync(entry);

        if (entrylstat.isFile() || entrylstat.isSymbolicLink()) {
            await removeFileAsync(entry);

        } else if (entrylstat.isDirectory()) {
            dirs.push(entry);
            entries.push(...(await readdirAsync(entry)).map((value) => path.join(entry, value)));

        } else {
            throw new Error(`Unsupported target: ${entry}`);
        }
    }

    while (dirs.length > 0) {
        await rmdirAsync(dirs.pop());
    }
}

export async function removeFileAsync(target: string): Promise<void> {
    if (!(await existsAsync(target))) {
        return;
    }

    const lstat = await lstatAsync(target);

    if (!lstat.isFile() && !lstat.isSymbolicLink()) {
        return;
    }

    await unlinkAsync(target);
}

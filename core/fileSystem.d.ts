//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { PathLike, MakeDirectoryOptions, Stats, Dirent } from "fs";

declare export function existsSync(path: PathLike): boolean;
declare export function createDirectorySync(dirname: string): void;
declare export function removeFileSync(target: string): void;
declare export function removeDirectorySync(target: string): void;
declare export function copyDirectorySync(srcDir: string, destDir: string): void;

declare export function mkdirAsync(path: PathLike, mode?: string | number | MakeDirectoryOptions): Promise<void>;
declare export function rmdirAsync(path: PathLike): Promise<void>;
declare export function readdirAsync(path: PathLike, options?: { encoding: BufferEncoding | null; withFileTypes?: false } | BufferEncoding | null): Promise<string[]>;
declare export function readdirAsync(path: PathLike, options: "buffer" | { encoding: "buffer"; withFileTypes?: false }): Promise<Buffer[]>;
declare export function readdirAsync(path: PathLike, options?: { encoding?: string | null; withFileTypes?: false } | string | null): Promise<string[] | Buffer[]>;
declare export function readdirAsync(path: PathLike, options: { withFileTypes: true }): Promise<Dirent[]>;
declare export function statAsync(path: PathLike): Promise<Stats>;
declare export function lstatAsync(path: PathLike): Promise<Stats>;
declare export function unlinkAsync(path: PathLike): Promise<void>;
declare export function existsAsync(path: PathLike): Promise<boolean>;
declare export function copyFileAsync(src: PathLike, dst: PathLike, flags?: number): Promise<void>;
declare export function accessAsync(path: PathLike, mode?: number): Promise<void>;

declare export function copyDirectoryAsync(srcDir: string, destDir: string): Promise<void>;
declare export function createDirectoryAsync(dirname: string): Promise<void>;
declare export function removeDirectoryAsync(target: string): Promise<void>;
declare export function removeFileAsync(target: string): Promise<void>;
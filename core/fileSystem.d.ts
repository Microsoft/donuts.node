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

declare export function openAsync(path: PathLike, flags: string | number, mode?: string | number): Promise<number>;
declare export function closeAsync(fd: number): Promise<void>;
declare export function writeAsync(fd: number, string: any, position?: number | null, encoding?: string | null): Promise<{ bytesWritten: number, buffer: string }>;
declare export function writeAsync<TBuffer extends BinaryData>(fd: number, buffer?: TBuffer, offset?: number, length?: number, position?: number | null): Promise<{ bytesWritten: number, buffer: TBuffer }>;
declare export function readAsync<TBuffer extends BinaryData>(fd: number, buffer: TBuffer, offset: number, length: number, position: number | null): Promise<{ bytesRead: number, buffer: TBuffer }>;

declare export function copyDirectoryAsync(srcDir: string, destDir: string): Promise<void>;
declare export function createDirectoryAsync(dirname: string): Promise<void>;
declare export function removeDirectoryAsync(target: string): Promise<void>;
declare export function removeFileAsync(target: string): Promise<void>;

declare interface ITempOptions {
    parentDir?: string;
    ext?: string;
    prefix?: string;
    keep?: boolean;
    mode?: number;
}

declare export function tempDirSync(options?: ITempOptions): string;
declare export function tempDirSync(parentDir?: string, ext?: string, prefix?: string, keep?: boolean, mode?: number): string;

declare export function tempFileSync(options: ITempOptions): string;
declare export function tempFileSync(parentDir?: string, ext?: string, prefix?: string, keep?: boolean, mode?: number): string;

declare export function tempNameSync(parentDir?: string, ext?: string, prefix?: string): string;

declare export function tempDirAsync(options: ITempOptions): Promise<string>;
declare export function tempDirAsync(parentDir?: string, ext?: string, prefix?: string, keep?: boolean, mode?: number): Promise<string>;

declare export function tempFileAsync(options: ITempOptions): Promise<string>;
declare export function tempFileAsync(parentDir?: string, ext?: string, prefix?: string, keep?: boolean, mode?: number): Promise<string>;
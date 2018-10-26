//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare module "tmp" {
    export interface CreationCallback {
        /**
         * @param err if the creation fails, the error will be wrapped in this param.
         * @param path the path to the temp file or directory.
         * @param cleanupCallback the callback function to clean up the temp file/directory manually.
         */
        (err: any, path: string, cleanupCallback: () => void): void;
    }

    export interface TempNameCallback {
        /**
         * @param err if the generation fails, the error will be wrapped in this param.
         * @param path the unique name (path).
         */
        (err: any, path: string): void;
    }

    export interface IOptions {
        /**
         * the file mode to create with, it fallbacks to 0600 on file creation and 0700 on directory creation.
         */
        mode?: number;

        /**
         *  the optional prefix, fallbacks to tmp- if not provided.
         */
        prefix?: string;

        /**
         * the optional postfix, fallbacks to .tmp on file creation
         */
        postfix?: string;

        /**
         * mkstemp like filename template, no default.
         */
        template?: string;

        /**
         * the optional temporary directory, fallbacks to system default (guesses from environment).
         */
        dir?: string;

        /**
         * how many times should the function try to get a unique filename before giving up, default 3.
         */
        tries?: number;

        /**
         * Signals that the temporary file or directory should not be deleted on exit, default is false, means delete.
         */
        keep?: boolean;

        /**
         * Recursively removes the created temporary directory, even when it's not empty. default is false.
         */
        unsafeCleanup?: boolean;
    }

    export interface ITempObject {
        /**
         * The path to the temp file/directory.
         */
        readonly name: string;

        /**
         * The file descriptor of the temp file.
         */
        readonly fd?: number;

        /**
         * Manually remove the temp file/directory.
         */
        removeCallback(): void;
    }

    /**
     * Simple temporary file creation in async manner, the file will be closed and unlinked on process exit.
     * @param callback The callback function when the temp file is created.
     */
    export function file(callback: CreationCallback): void;

    /**
     * Simple temporary file creation in async manner, the file will be closed and unlinked on process exit.
     * @param options The options for creating the temp file.
     * @param callback The callback function when the temp file is created.
     */
    export function file(options: IOptions, callback: CreationCallback): void;

    /**
     * Simple temporary file creation in sync manner, the file will be closed and unlinked on process exit.
     */
    export function fileSync(): ITempObject;

    /**
     * Simple temporary file creation in sync manner, the file will be closed and unlinked on process exit.
     * @param options The options for creating the temp file.
     */
    export function fileSync(options: IOptions): ITempObject;

    /**
     * Simple temporary directory creation in async manner, it will be removed on process exit.
     * @param callback The callback function when the temp directory is created.
     */
    export function dir(callback: CreationCallback): void;

    /**
     * Simple temporary directory creation in async manner, it will be removed on process exit.
     * @param options The options for creating the temp directory.
     * @param callback The callback function when the temp directory is created.
     */
    export function dir(options: IOptions, callback: CreationCallback): void;

    /**
     * Simple temporary directory creation in sync manner, it will be removed on process exit.
     */
    export function dirSync(): ITempObject;

    /**
     * Simple temporary directory creation in sync manner, it will be removed on process exit.
     * @param options The options for creating the temp directory.
     */
    export function dirSync(options: IOptions): ITempObject;

    /**
     * Generate a unique filename in async manner.
     * @param callback The callback function when the temp name is created.
     */
    export function tmpName(callback: TempNameCallback): void;

    /**
     * Generate a unique filename in async manner.
     * @param options The options for creating the temp name.
     * @param callback The callback function when the temp name is created.
     */
    export function tmpName(options: IOptions, callback: TempNameCallback): void;

    /**
     * Generate a unique filename in sync manner.
     * @returns The unique name.
     */
    export function tmpNameSync(): string;

    /**
     * Generate a unique filename in sync manner.
     * @param options The options for creating the temp name.
     * @returns The unique name.
     */
    export function tmpNameSync(options: IOptions): string;

    /**
     * Cleanup the temporary files even when an uncaught exception occurs.
     */
    export function setGracefulCleanup();
}
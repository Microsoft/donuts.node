//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/// <reference path="./types.modularity.d.ts" />

/**
 * Create a module manager with either a connection info or a communication host.
 * @param options a connection info or a communication host.
 * @returns The instance of the module manager.
 */
declare export function createModuleManager(options: Donuts.Remote.IConnectionInfo | Donuts.Remote.ICommunicationHost): Donuts.Modularity.IModuleManager;

/**
 * Spawn a new node.js process with a module manager initialized as default.
 * @param connectionInfo The connection info for the child process connect with.
 * @param modulePath The path to the module to run.
 */
declare export function fork(connectionInfo: Donuts.Remote.IConnectionInfo, modulePath: string): import("child_process").ChildProcess;

/**
 * Get the default module manager.
 * @returns The default module manager if there is one. Otherwise, undefined.
 */
declare export function getModuleManager(): Donuts.Modularity.IModuleManager;

/**
 * Set the default module manager.
 * @param moduleManager The instance of ModuleManager to set as the default.
 */
declare export function setModuleManager(moduleManager: Donuts.Modularity.IModuleManager): void;

interface ICmdArgs {
    ConnectionInfo: string;
    ModulePath: string;
}

declare export const CmdArgs: ICmdArgs;

//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export class ModuleManager implements Donuts.Modularity.IModuleManager {
    constructor(communication: Donuts.Remote.ICommunicationHost | Donuts.Remote.ICommunicator);

    public loadModulesAsync(modulePaths: Array<string>): Promise<this>;

    public getComponentAsync<T>(componentIdentity: string, ...extraArgs: Array<any>): Promise<Component<T>>;

    public disposeAsync(): Promise<void>;
}
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export class ModuleManager implements Donuts.Modularity.IModuleManager {
    constructor(communication: Donuts.Remote.ICommunicationHost | Donuts.Remote.ICommunicator);

    public loadModulesAsync(modulePaths: Array<string>): Promise<this>;

    /**
     * Dynamically register/override components.
     * @param namespace The namespace for the components to register under.
     * @param componentInfos The components to register.
     * @param force Whether to override if the component names have already been registered.
     */
    public registerComponentsAsync(namespace: string, componentInfos: Array<Donuts.Modularity.IComponentInfo<any>>, force?: boolean): Promise<this>;

    public getComponentAsync<T>(componentIdentity: string, ...extraArgs: Array<any>): Promise<Component<T>>;

    public disposeAsync(): Promise<void>;
}
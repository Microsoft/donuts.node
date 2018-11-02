//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts.Modularity {
    interface ILoadedModuleInfo extends IModuleInfo {
        module: IModule;
        components: Array<IComponentInfo<any>>;
    }

    interface IObjectRemotingRouter extends IDisposable {
        requestAsync<T>(identifier: string, ...extraArgs: Array<any>): Promise<T>
    }
}
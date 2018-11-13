//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts.DI {
    interface IDiDescriptor<T> {
        (diContainer: IDiContainer, ...extraArgs: Array<any>): T;
    }

    interface IDiContainer {
        getDep<T>(name: string, ...extraArgs: Array<any>): T;
        get<T>(name: string): IDiDescriptor<T>;
        set(name: string, descriptor: IDiDescriptor<any>): this;
    }

    interface IDiDescriptorDictionary {
        get<T>(name: string): IDiDescriptor<T>;
        set(name: string, descriptor: IDiDescriptor<any>): this;
    }
}

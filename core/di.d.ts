//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare namespace DI {
    declare interface IDiDescriptor {
        (diContainer: IDiContainer, ...extraArgs: Array<any>): any;
    }
    
    declare interface IDiContainer {
        getDep<T>(name: string, ...extraArgs: Array<any>): T;
        get(name: string): IDiDescriptor;
        set(name: string, descriptor: IDiDescriptor): IDiContainer;
    }
    
    declare interface IDiDescriptorDictionary {
        get(name: string): IDiDescriptor;
        set(name: string, descriptor: IDiDescriptor): void;
    }
}

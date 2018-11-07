//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export class DiDescriptorDictionary implements Donuts.DI.IDiDescriptorDictionary {
    constructor();

    public get<T>(name: stirng): Donuts.DI.IDiDescriptor<T>;
    public set(name: string, descriptor: Donuts.DI.IDiDescriptor<any>): this;
}

declare export class DiContainer implements Donuts.DI.IDiContainer {
    constructor(dictionary?: Donuts.DI.IDiDescriptorDictionary);

    public getDep<T>(name: string, ...extraArgs: Array<any>): T;
    public get<T>(name: string): Donuts.DI.IDiDescriptor<T>;
    public set(name: string, descriptor: Donuts.DI.IDiDescriptor<any>): this;
}
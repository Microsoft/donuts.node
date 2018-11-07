//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export class ObjectRemotingProxy implements Donuts.Remote.IObjectRemotingProxy {
    public get id(): string;
    public get communicator(): Donuts.Remote.ICommunicator;
    public get routePattern(): Donuts.Remote.IRoutePattern;

    public get resolver(): Donuts.Remote.ObjectResolver;
    public set resolver(resolver: Donuts.Remote.ObjectResolver): void;

    constructor(communicator: Donuts.Remote.ICommunicator, path?: string, ownCommunicator: boolean = false, proxyId?: string);

    public requestAsync<T>(identifier: string, ...extraArgs: Array<any>): Promise<T>;
    public releaseAsync(refId: string): Promise<void>;

    public applyAsync<T>(refId: string, thisArg: any, args: Array<any>): Promise<T>;
    public getPropertyAsync<T>(refId: string, property: string | number): Promise<T>;
    public setPropertyAsync(refId: string, property: string | number, value: any): Promise<boolean>;
    public disposeAsync(): Promise<void>;
}
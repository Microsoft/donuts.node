//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare module "donut.node/proxy.object" {
    import { IDisposable } from "donut.node/common";
    import { IRoutePattern, ICommunicator } from "donut.node/remoting";

    export interface Resolver {
        (proxy: IObjectRemotingProxy, name: string, ...extraArgs: Array<any>): Promise<IDisposable>;
    }

    export interface IObjectRemotingProxy extends IDisposable {
        readonly id: string;
        readonly routePattern: IRoutePattern;
        readonly communicator: ICommunicator;

        requestAsync<T>(identifier: string, ...extraArgs: Array<any>): Promise<T & IDisposable>;

        setResolver(resolver: Resolver): void;
        getResolver(): Resolver;
    }
}

declare module "donut.node/module-manager" {
    import { ICommunicator, IRoutePattern } from "donut.node/remoting";
    import { IObjectRemotingProxy } from "donut.node/proxy.object";

    export interface IModuleManager {
        getComponentAsync(
            componentIdentity: "remoting.proxy",
            pattern: string | RegExp,
            communicator: ICommunicator,
            ownCommunicator?: boolean): Promise<IObjectRemotingProxy>;
    }
}

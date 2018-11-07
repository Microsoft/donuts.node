//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/// <reference path="./types.remote.d.ts" />

/**
 * Check if the given object is a ChannelProxy (IChannelProxy).
 * @param value The object to check.
 * @returns True if the object is a ChannelProxy or ChannelProxy-alike. Otherwise, false.
 */
declare export function isChannelProxy(value: any): value is Donuts.Remote.IChannelProxy;

/**
 * Check if the given object is a ChannelHostProxy (IChannelHostProxy).
 * @param  value The object to check.
 * @returns True if the object is a ChannelHostProxy or ChannelHostProxy-alike. Otherwise, false.
 */
declare export function isChannelHostProxy(value: any): value is Donuts.Remote.IChannelHostProxy;

/**
 * Check if the given object is a ChannelHostProxy (IChannelHostProxy).
 * @param value The object to check.
 * @returns True if the object is a ChannelHostProxy or ChannelHostProxy-alike. Otherwise, false.
 */
declare export function isCommunicator(value: any): value is Donuts.Remote.ICommunicator;

/**
 * Check if the given object is a CommunicationHost (ICommunicationHost).
 * @param value The object to check.
 * @returns True if the object is a CommunicationHost or CommunicationHost-alike. Otherwise, false.
 */
declare export function isCommunicationHost(value: any): value is Donuts.Remote.ICommunicationHost;

/**
 * Check if the given object is a RoutePattern (IRoutePattern).
 * @param pattern The object to check.
 * @returns True if the object is a communicator or communicator-alike. Otherwise, false.
 */
declare export function isRoutePattern(value: any): value is Donuts.Remote.IRoutePattern;

/**
 * Check if the given object is a IConnectionInfo.
 * @param value The object to check.
 * @returns True if the value is a ConnectionInfo. Otherwise, false.
 */
declare export function isConnectionInfo(value: any): value is Donuts.Remote.IConnectionInfo;

/**
 * Connect to the target remote with the connection info.
 * @param connectionInfo The connection info of the remote.
 * @returns The instance of the communicator which connects to the remote.
 */
declare export function connect(connectionInfo: Donuts.Remote.IConnectionInfo): Donuts.Remote.ICommunicator;

declare module "donuts.node-remote/communicator" {
    export const UuidNamespace: string;

    export class Communicator implements Donuts.Remote.ICommunicator {
        public get disposed(): boolean;

        constructor(channelProxy: Donuts.Remote.IChannelProxy, options: Donuts.Remote.ICommunicatorConstructorOptions);
        public map(pattern: Donuts.Remote.IRoutePattern, asyncHandler: Donuts.Remote.AsyncRequestHandler): this;
        public unmap(pattern: Donuts.Remote.IRoutePattern): this;
        public sendAsync<TRequest, TResponse>(path: string, content: TRequest): Promise<TResponse>;
        public disposeAsync(): Promise<void>;
    }
}

declare module "donuts.node-remote/communication-host" {
    import { EventEmitter } from "events";

    export class CommunicationHost extends EventEmitter implements Donuts.Remote.ICommunicationHost {
        public get disposed(): boolean;

        constructor(host: Donuts.Remote.IChannelHostProxy, options: Donuts.Remote.ICommunicatorConstructorOptions);

        public map(pattern: Donuts.Remote.IRoutePattern, asyncHandler: Donuts.Remote.AsyncRequestHandler): this;
        public unmap(pattern: Donuts.Remote.IRoutePattern): this;
        public disposeAsync(): Promise<void>;
    }
}

declare module "donuts.node-remote/object-remoting-proxy" {
    export class ObjectRemotingProxy implements Donuts.Remote.IObjectRemotingProxy {
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
}

declare module "donuts.node-remote/proxy/channel-host-proxy" {
    export abstract class ChannelHostProxy<THost> implements Donuts.Remote.IChannelHostProxy {
        public abstract get connectionInfo(): Donuts.Remote.IConnectionInfo;
        protected get disposed(): boolean;

        public setHandler(type: string, handler: (...args: Array<any>) => void): this;
        public disposeAsync(): Promise<void>;
        constructor(host: THost);

        protected emit(type: string, ...args: Array<any>): void;
    }
}

declare module "donuts.node-remote/proxy/channel-proxy" {
    export abstract class ChannelProxy<TChannel> implements Donuts.Remote.IChannelProxy {
        public get channel(): TChannel;
        protected get disposed(): boolean;

        constructor(channel: TChannel);
        public disposeAsync(): Promise<void>;
        public abstract sendData(data: any): boolean;
        public setHandler(type: string, handler: Donuts.Remote.ChannelProxyDataHandler): this;

        protected triggerDataHandler(data: any): void;
    }
}

declare module "donuts.node-remote/proxy/process-proxy" {
    import { ChildProcess } from "child_process";
    import { ChannelProxy } from "donuts.node-remote/proxy/channel-proxy";

    export class ProcessProxy extends ChannelProxy<ChildProcess> {
        public static isValidChannel(channel: any): channel is ChildProcess;

        constructor(channel: ChildProcess);
    }
}

declare module "donuts.node-remote/proxy/socket-host-proxy" {
    import { Server } from "net";
    import { ChannelHostProxy } from "donuts.node-remote/proxy/channel-host-proxy";

    export class SocketHostProxy extends ChannelHostProxy<Server> {
        public static generateConnectionInfo(socketServer: Server): Donuts.Remote.IConnectionInfo;

        constructor(socketServer: Server);
    }
}

declare module "donuts.node-remote/proxy/socket-proxy" {
    import { Socket } from "net";
    import { ChannelProxy } from "donuts.node-remote/proxy/channel-proxy";

    export class SocketProxy extends ChannelProxy<Socket> {
        public static isValidChannel(channel: any): channel is Socket;

        constructor(channel: Socket);
    }

}

declare module "donuts.node-remote/pattern/regex" {
    export class Regex implements Donuts.Remote.IRoutePattern {
        constructor(pattern: RegExp);

        public getRaw(): any;
        public match(path: string): IRoutePathInfo;
        public equals(pattern: IRoutePattern): boolean;
    }
}

declare module "donuts.node-remote/pattern/string" {
    export class String implements Donuts.Remote.IRoutePattern {
        constructor(pattern: string);

        public getRaw(): any;
        public match(path: string): IRoutePathInfo;
        public equals(pattern: IRoutePattern): boolean;
    }
}

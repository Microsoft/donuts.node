//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
namespace Donuts.Remote {
    type ChannelProxyDataHandler = (channel: IChannelProxy, data: any) => void;
    type AsyncRequestHandler = (communicator: ICommunicator, pathInfo: IRoutePathInfo, content: any) => Promise<any>;
    type ChannelHostProxyConnectionHandler = (hostProxy: IChannelHostProxy, channelProxy: IChannelProxy) => void;
    type ChannelHostProxyErrorHandler = (hostProxy: IChannelHostProxy, error: any) => void;
    type ChannelHostProxyEventHandler = (hostProxy: IChannelHostProxy) => void;

    interface ICommunicatorConstructorOptions {
        id?: string;

        /**
         * Timeout if the remoting operation takes too long. Default: infinity.
         */
        timeout?: number;
    }

    interface IMessage {
        id: string;
        succeeded?: boolean;
        path?: string;
        body?: any;
    }

    interface IChannelProxy extends Donuts.IDisposable {
        sendData(data: any): boolean;
        setHandler(type: "data", handler: ChannelProxyDataHandler): this;
    }

    interface IChannelHostProxy extends Donuts.IDisposable {
        readonly connectionInfo: IConnectionInfo;

        setHandler(type: "connection", handler: ChannelHostProxyConnectionHandler): this;
        setHandler(type: "error", handler: ChannelHostProxyErrorHandler): this;
        setHandler(type: "close", handler: ChannelHostProxyEventHandler): this;
        setHandler(type: "listening", handler: ChannelHostProxyEventHandler): this;
    }

    interface IRoutePathInfo extends Donuts.IDictionary<string> {
        /**
         * The raw path.
         */
        ["~"]: string;
    }

    interface IRoutePattern {
        /**
         * Get the raw pattern.
         * @returns The raw pattern.
         */
        getRaw(): any;

        /**
         * Check if the path is matching with the pattern and return the path info.
         * @param path The raw path.
         * @returns The matched path info. Otherwise, null.
         */
        match(path: string): IRoutePathInfo;

        /**
         * Check if the current route pattern is the same as the pattern given.
         * @param pattern The route pattern to compare with.
         * @returns True if the current pattern is the same as the given one. Otherwise, false.
         */
        equals(pattern: IRoutePattern): boolean;
    }

    interface IConnectionInfo {
        moduleName: string;
        initFunction: string;
        initFunctionParams: Array<any>;
        communicatorOptions?: ICommunicatorConstructorOptions;
    }

    interface ICommunicationHost extends Donuts.IDisposable {
        readonly communicators: Donuts.IDictionary<ICommunicator>;
        readonly connectionInfo: IConnectionInfo;

        on(event: "connection", handler: (host: ICommunicationHost, communicator: ICommunicator) => void): this;
        on(event: "error", handler: (host: ICommunicationHost, error: any) => void): this;
        on(event: "close", handler: (host: ICommunicationHost) => void): this;
        on(event: "listening", handler: (host: ICommunicationHost) => void): this;
        on(event: string, listener: (...args: any[]) => void): this;

        once(event: "connection", handler: (host: ICommunicationHost, communicator: ICommunicator) => void): this;
        once(event: "error", handler: (host: ICommunicationHost, error: any) => void): this;
        once(event: "close", handler: (host: ICommunicationHost) => void): this;
        once(event: "listening", handler: (host: ICommunicationHost) => void): this;
        once(event: string, listener: (...args: any[]) => void): this;

        off(event: "connection", handler: (host: ICommunicationHost, communicator: ICommunicator) => void): this;
        off(event: "error", handler: (host: ICommunicationHost, error: any) => void): this;
        off(event: "close", handler: (host: ICommunicationHost) => void): this;
        off(event: "listening", handler: (host: ICommunicationHost) => void): this;
        off(event: string, listener: (...args: any[]) => void): this;

        removeAllListeners(event?: string): this;
        emit(event: string, ...args: any[]): boolean;

        /**
         * Map the pattern to the given asyncHandler for all the communicators belonging to the host.
         * @param pattern The pattern to map.
         * @param asyncHandler The handler to map to.
         */
        map(pattern: IRoutePattern, asyncHandler: AsyncRequestHandler): this;

        /**
         * Unmap the pattern for all the communicators belonging to the host.
         * @param pattern The pattern to unmap.
         * @returns The handler was mapped. Otherwise, null.
         */
        unmap(pattern: IRoutePattern): this;
    }

    interface ICommunicator extends Donuts.IDisposable {
        readonly id: string;

        /**
         * Map the pattern to the given asyncHandler.
         * @param pattern The pattern to map.
         * @param asyncHandler The handler to map to.
         */
        map(pattern: IRoutePattern, asyncHandler: AsyncRequestHandler): this;

        /**
         * Unmap the pattern.
         * @param pattern The pattern to unmap.
         * @returns The handler was mapped. Otherwise, null.
         */
        unmap(pattern: IRoutePattern): this;

        /**
         * Send request to the specific path to the remote.
         * @param path The path to send to.
         * @param content The content to send.
         * @returns A promise representing the async task with the remote response as the result.
         */
        sendAsync<TRequest, TResponse>(path: string, content: TRequest): Promise<TResponse>;
    }

    interface Resolver {
        (proxy: IObjectRemotingProxy, name: string, ...extraArgs: Array<any>): Promise<any>;
    }

    interface IObjectRemotingProxy extends IDisposable {
        readonly id: string;
        readonly routePattern: IRoutePattern;
        readonly communicator: ICommunicator;
    
        requestAsync<T>(identifier: string, ...extraArgs: Array<any>): Promise<T>;
    
        setResolver(resolver: Resolver): void;
        getResolver(): Resolver;
    }
}
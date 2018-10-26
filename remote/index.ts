//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IDisposable, IDictionary } from "donuts.node";
import * as utils from "donuts.node/utils";
import { Communicator } from "./communicator";
import { EventEmitter } from "events";

export type ChannelProxyDataHandler = (channel: IChannelProxy, data: any) => void;
export type AsyncRequestHandler = (communicator: ICommunicator, pathInfo: IRoutePathInfo, content: any) => Promise<any>;

export type ChannelHostProxyConnectionHandler = (hostProxy: IChannelHostProxy, channelProxy: IChannelProxy) => void;
export type ChannelHostProxyErrorHandler = (hostProxy: IChannelHostProxy, error: any) => void;
export type ChannelHostProxyEventHandler = (hostProxy: IChannelHostProxy) => void;

export interface ICommunicatorConstructorOptions {
    id?: string;

    /**
     * Timeout if the remoting operation takes too long. Default: infinity.
     */
    timeout?: number;
}

export interface IMessage {
    id: string;
    succeeded?: boolean;
    path?: string;
    body?: any;
}

export interface IChannelProxy extends IDisposable {
    sendData(data: any): boolean;
    setHandler(type: "data", handler: ChannelProxyDataHandler): this;
}

export interface IChannelHostProxy extends IDisposable {
    readonly connectionInfo: IConnectionInfo;

    setHandler(type: "connection", handler: ChannelHostProxyConnectionHandler): this;
    setHandler(type: "error", handler: ChannelHostProxyErrorHandler): this;
    setHandler(type: "close", handler: ChannelHostProxyEventHandler): this;
    setHandler(type: "listening", handler: ChannelHostProxyEventHandler): this;
}

export interface IRoutePathInfo extends IDictionary<string> {
    /**
     * The raw path.
     */
    ["~"]: string;
}

export interface IRoutePattern {
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

export interface IConnectionInfo {
    moduleName: string;
    initFunction: string;
    initFunctionParams: Array<any>;
    communicatorOptions?: ICommunicatorConstructorOptions;
}

export interface ICommunicationHost extends IDisposable {
    readonly communicators: IDictionary<ICommunicator>;
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

export interface ICommunicator extends IDisposable {
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

/**
 * Check if the given object is a ChannelProxy (IChannelProxy).
 * @param value The object to check.
 * @returns True if the object is a ChannelProxy or ChannelProxy-alike. Otherwise, false.
 */
export function isChannelProxy(value: any): value is IChannelProxy {
    return !utils.isNullOrUndefined(value)
        && utils.isFunction(value.setHandler)
        && utils.isFunction(value.sendData);
}

/**
 * Check if the given object is a ChannelHostProxy (IChannelHostProxy).
 * @param value The object to check.
 * @returns True if the object is a ChannelHostProxy or ChannelHostProxy-alike. Otherwise, false.
 */
export function isChannelHostProxy(value: any): value is IChannelHostProxy {
    return !utils.isNullOrUndefined(value)
        && utils.isFunction(value.setHandler)
        && isConnectionInfo(value.connectionInfo);
}

/**
 * Check if the given object is a Communicator (ICommunicator).
 * @param communicator The object to check.
 * @returns True if the object is a Communicator or Communicator-alike. Otherwise, false.
 */
export function isCommunicator(communicator: any): communicator is ICommunicator {
    return !utils.isNullOrUndefined(communicator)
        && utils.isString(communicator.id)
        && utils.isFunction(communicator.map)
        && utils.isFunction(communicator.unmap)
        && utils.isFunction(communicator.sendAsync);
}

/**
 * Check if the given object is a CommunicationHost (ICommunicationHost).
 * @param value The object to check.
 * @returns True if the object is a CommunicationHost or CommunicationHost-alike. Otherwise, false.
 */
export function isCommunicationHost(value: any): value is ICommunicationHost {
    return !utils.isNullOrUndefined(value)
        && utils.isObject(value.communicators)
        && isConnectionInfo(value.connectionInfo)
        && utils.isFunction(value.map)
        && utils.isFunction(value.unmap)
        && value instanceof EventEmitter;
}

/**
 * Check if the given object is a RoutePattern (IRoutePattern).
 * @param communicator The object to check.
 * @returns True if the object is a communicator or communicator-alike. Otherwise, false.
 */
export function isRoutePattern(pattern: IRoutePattern): pattern is IRoutePattern {
    return !utils.isNullOrUndefined(pattern)
        && utils.isFunction(pattern.equals)
        && utils.isFunction(pattern.getRaw)
        && utils.isFunction(pattern.match);
}

export function isConnectionInfo(value: any): value is IConnectionInfo {
    return !utils.isNullOrUndefined(value)
        && utils.isString(value.moduleName)
        && utils.isString(value.initFunction);
}

/**
 * Connect to the target remote with the connection info.
 * @param connectionInfo The connection info of the remote.
 * @returns The instance of the communicator which connects to the remote.
 */
export function connect(connectionInfo: IConnectionInfo): ICommunicator {

    if (!isConnectionInfo(connectionInfo)) {
        throw new Error("Invalid connectionInfo provided.");
    }

    let obj: any = require(connectionInfo.moduleName);

    for (const memberName of connectionInfo.initFunction.split(".")) {
        obj = obj[memberName];
    }

    const init: (connectionInfo: IConnectionInfo) => IChannelProxy = obj;

    if (!utils.isFunction(init)) {
        throw new Error(`Cannot find the init function: ${connectionInfo.initFunction}`);
    }

    return new Communicator(init(connectionInfo), connectionInfo.communicatorOptions);
}

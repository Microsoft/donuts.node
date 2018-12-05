//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/// <reference path="./types.remote.d.ts" />
/// <reference path="./postal-service/types.d.ts" />

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

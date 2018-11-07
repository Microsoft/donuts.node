//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export const UuidNamespace: string;

declare export class Communicator implements Donuts.Remote.ICommunicator {
    public get disposed(): boolean;

    constructor(channelProxy: Donuts.Remote.IChannelProxy, options: Donuts.Remote.ICommunicatorConstructorOptions);
    public map(pattern: Donuts.Remote.IRoutePattern, asyncHandler: Donuts.Remote.AsyncRequestHandler): this;
    public unmap(pattern: Donuts.Remote.IRoutePattern): this;
    public sendAsync<TRequest, TResponse>(path: string, content: TRequest): Promise<TResponse>;
    public disposeAsync(): Promise<void>;
}
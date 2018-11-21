//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export class Communicator implements Donuts.Remote.ICommunicator {
    public readonly id: string;
    public get disposed(): boolean;

    constructor(channelProxy: Donuts.Remote.IChannelProxy, options: Donuts.Remote.ICommunicatorConstructorOptions);

    public map(pattern: Donuts.Remote.IRoutePattern, asyncHandler: Donuts.Remote.AsyncRequestHandler): this;
    public unmap(pattern: Donuts.Remote.IRoutePattern): this;

    public sendAsync<TRequest, TResponse>(path: string, content: TRequest): Promise<TResponse>;

    public on(event: "close", handler: (communicator: Donuts.Remote.ICommunicator) => void): this;
    public on(event: string, handler: (communicator: Donuts.Remote.ICommunicator, ...args: Array<any>) => void): this;

    public once(event: "close", handler: (communicator: Donuts.Remote.ICommunicator) => void): this;
    public once(event: string, handler: (communicator: Donuts.Remote.ICommunicator, ...args: Array<any>) => void): this;

    public off(event: "close", handler: (communicator: Donuts.Remote.ICommunicator) => void): this;
    public off(event: string, handler: (communicator: Donuts.Remote.ICommunicator, ...args: Array<any>) => void): this;

    public emit(event: string, ...args: Array<any>): boolean;

    public disposeAsync(): Promise<void>;
}
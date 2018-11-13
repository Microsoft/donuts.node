//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { EventEmitter } from "events";

declare export class CommunicationHost extends EventEmitter implements Donuts.Remote.ICommunicationHost {
    public readonly connectionInfo: Donuts.Remote.IConnectionInfo;
    
    public get disposed(): boolean;

    constructor(host: Donuts.Remote.IChannelHostProxy, options?: Donuts.Remote.ICommunicatorConstructorOptions);

    public map(pattern: Donuts.Remote.IRoutePattern, asyncHandler: Donuts.Remote.AsyncRequestHandler): this;
    public unmap(pattern: Donuts.Remote.IRoutePattern): this;

    public disposeAsync(): Promise<void>;
}
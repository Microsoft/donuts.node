//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export abstract class ChannelProxy<TChannel> implements Donuts.Remote.IChannelProxy {
    public get channel(): TChannel;
    protected get disposed(): boolean;

    constructor(channel: TChannel);
    public disposeAsync(): Promise<void>;
    public abstract sendData(data: any): boolean;
    public setHandler(type: string, handler: Donuts.Remote.ChannelProxyDataHandler): this;

    protected triggerDataHandler(data: any): void;
}
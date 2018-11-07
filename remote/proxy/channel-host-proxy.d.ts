//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export abstract class ChannelHostProxy<THost> implements Donuts.Remote.IChannelHostProxy {
    public abstract get connectionInfo(): Donuts.Remote.IConnectionInfo;

    protected host: THost;
    protected get disposed(): boolean;

    public setHandler(type: string, handler: (...args: Array<any>) => void): this;
    public disposeAsync(): Promise<void>;
    constructor(host: THost);

    protected emit(type: string, ...args: Array<any>): void;
}
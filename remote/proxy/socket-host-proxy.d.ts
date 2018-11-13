//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { Server } from "net";
import { ChannelHostProxy } from "./channel-host-proxy";

declare export function connectIpc(path: string): Donuts.Remote.IChannelProxy;

declare export class SocketHostProxy extends ChannelHostProxy<Server> {
    public static generateConnectionInfo(socketServer: Server): Donuts.Remote.IConnectionInfo;

    constructor(socketServer: Server);
}
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { Socket } from "net";
import { ChannelProxy } from "./channel-proxy";

declare export class SocketProxy extends ChannelProxy<Socket> {
    public static isValidChannel(channel: any): channel is Socket;

    constructor(channel: Socket);
}
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IDisposable } from "../common";

import { ChildProcess } from "child_process";
import { Socket } from "net";

export type ChannelType = NodeJS.Process | ChildProcess | Socket;

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
    readonly channel: ChannelType;
    
    sendData(data: any): boolean;
    setDataHandler(handler: ChannelProxyDataHandler): ChannelProxyDataHandler;
}

export interface ChannelProxyDataHandler {
    (channel: IChannelProxy, data: any): void;
}

export const UuidNamespace = "65ef6f94-e6c9-4c95-8360-6d29de87b1dd";

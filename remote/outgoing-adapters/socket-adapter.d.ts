//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { EventEmitter } from "donuts.node/event-emitter";
import { Socket as NetSocket } from "net";

import IMessage = Donuts.Remote.IMessage;
import ICommunicationPipeline = Donuts.Remote.ICommunicationPipeline;
import ICommunicationSource = Donuts.Remote.ICommunicationSource;

declare export class SocketAdapter
    extends EventEmitter
    implements ICommunicationSource {

    public constructor(socket: NetSocket, timeout?: number);

    public readonly handleOutgoingMessage: (pipeline: ICommunicationPipeline<any, any>, outgoingMsg: IMessage<any>) => Promise<IMessage<any>>;

    public on(event: "message", handler: (source: ICommunicationSource, incomingMessage: IMessage<any>) => void);
    public once(event: "message", handler: (source: ICommunicationSource, incomingMessage: IMessage<any>) => void);
    public off(event: "message", handler: (source: ICommunicationSource, incomingMessage: IMessage<any>) => void);
}
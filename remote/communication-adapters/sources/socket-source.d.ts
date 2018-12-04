//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { EventEmitter } from "donuts.node/event-emitter";
import { Server as NetServer } from "net";
import ICommunicationSource = Donuts.Remote.ICommunicationSource;

declare export class SocketSource
    extends EventEmitter
    implements ICommunicationSource {

    public constructor(server: NetServer);

    public on<TIncomingData>(event: "message", handler: (source: ICommunicationSource, incomingMail: IMessage<TIncomingData>) => void);
    public once<TIncomingData>(event: "message", handler: (source: ICommunicationSource, incomingMail: IMessage<TIncomingData>) => void);
    public off<TIncomingData>(event: "message", handler: (source: ICommunicationSource, incomingMail: IMessage<TIncomingData>) => void);

    public on<TOutgoingData, TIncomingData>(event: "target-acquired", handler: (source: ICommunicationSource, targetAsyncHandler: OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>) => void);
    public once<TOutgoingData, TIncomingData>(event: "target-acquired", handler: (source: ICommunicationSource, targetAsyncHandler: OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>) => void);
    public off<TOutgoingData, TIncomingData>(event: "target-acquired", handler: (source: ICommunicationSource, targetAsyncHandler: OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>) => void);

    public on(event: "target-lost", handler: (source: ICommunicationSource, targetAsyncHandler: OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>) => void);
    public once(event: "target-lost", handler: (source: ICommunicationSource, targetAsyncHandler: OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>) => void);
    public off(event: "target-lost", handler: (source: ICommunicationSource, targetAsyncHandler: OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>) => void);
}
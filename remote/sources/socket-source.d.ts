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

    public getTargetNames(): Array<string>;

    public on<TIncommingData>(event: "message", handler: (source: ICommunicationSource, incomingMessage: IMessage<TIncommingData>) => void);
    public once<TIncommingData>(event: "message", handler: (source: ICommunicationSource, incomingMessage: IMessage<TIncommingData>) => void);
    public off<TIncommingData>(event: "message", handler: (source: ICommunicationSource, incomingMessage: IMessage<TIncommingData>) => void);

    public on<TOutgoingData, TIncommingData>(event: "target-acquired", handler: (source: ICommunicationSource, targetName: string, targetAsyncHandler: OutgoingAsyncHandler<TOutgoingData, TIncommingData>) => void);
    public once<TOutgoingData, TIncommingData>(event: "target-acquired", handler: (source: ICommunicationSource, targetName: string, targetAsyncHandler: OutgoingAsyncHandler<TOutgoingData, TIncommingData>) => void);
    public off<TOutgoingData, TIncommingData>(event: "target-acquired", handler: (source: ICommunicationSource, targetName: string, targetAsyncHandler: OutgoingAsyncHandler<TOutgoingData, TIncommingData>) => void);

    public on(event: "target-lost", handler: (source: ICommunicationSource, targetName: string) => void);
    public once(event: "target-lost", handler: (source: ICommunicationSource, targetName: string) => void);
    public off(event: "target-lost", handler: (source: ICommunicationSource, targetName: string) => void);
}
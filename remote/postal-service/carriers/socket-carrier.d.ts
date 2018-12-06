//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import IPostalCarrier = Donuts.Remote.PostalService.IPostalCarrier;
import IMail = Donuts.Remote.PostalService.IMail;
import IPostBox = Donuts.Remote.PostalService.IPostBox;

import { EventEmitter } from "donuts.node/event-emitter";
import { Server as SocketServer } from "net";

declare export class SocketCarrier<TOutgoingData, TIncomingData>
    extends EventEmitter
    implements IPostalCarrier<TOutgoingData, TIncomingData>, Donuts.IDisposable {

    public constructor(socketServer: SocketServer);

    public preOn(event: "mail", asyncHandler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
    public preOnce(event: "mail", asyncHandler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
    public on(event: "mail", asyncHandler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
    public once(event: "mail", asyncHandler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
    public off(event: "mail", asyncHandler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);

    public preOn(event: "postbox-acquired", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
    public preOnce(event: "postbox-acquired", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
    public on(event: "postbox-acquired", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
    public once(event: "postbox-acquired", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
    public off(event: "postbox-acquired", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);

    public preOn(event: "postbox-lost", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
    public preOnce(event: "postbox-lost", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
    public on(event: "postbox-lost", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
    public once(event: "postbox-lost", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
    public off(event: "postbox-lost", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
}

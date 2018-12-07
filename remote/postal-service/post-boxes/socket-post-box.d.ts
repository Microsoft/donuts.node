//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import IPostBox = Donuts.Remote.PostalService.IPostBox;
import { EventEmitter } from "donuts.node/event-emitter";
import { Socket } from "net";

declare export class SocketPostBox<TOutgoingData, TIncomingData>
    extends EventEmitter
    implements IPostBox<TOutgoingData, TIncomingData> {
    public readonly origin: string;

    public constructor(origin: string, socket: Socket, timeout?: number);

    public sendMailAsync(mail: IMail<TOutgoingData>): Promise<IMail<TIncomingData>>;
    public dropMail(mail: IMail<TOutgoingData>): void;

    public preOn(event: "mail", asyncHandler: (postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
    public preOnce(event: "mail", asyncHandler: (postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
    public on(event: "mail", asyncHandler: (postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
    public once(event: "mail", asyncHandler: (postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
    public off(event: "mail", asyncHandler: (postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
}
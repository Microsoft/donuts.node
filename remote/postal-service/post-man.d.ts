//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import IPostMan = Donuts.Remote.PostalService.IPostMan
import IMail = Donuts.Remote.PostalService.IMail;
import IPostBox = Donuts.Remote.PostalService.IPostBox;

import { PostManBase } from "./post-man-base";

declare export class PostMan<TOutgoingData, TIncomingData>
    extends PostManBase<TOutgoingData, TIncomingData> {

    public constructor(
        operator: Donuts.ConditionalOperator,
        mailAsyncHandler: (postman: IPostMan<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);

    public deliverAsync(postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>): Promise<IMail<TOutgoingData>>;
}
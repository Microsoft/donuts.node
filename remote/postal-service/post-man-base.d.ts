//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { ConditionGroup } from "donuts.node/condition-group";

import IPostMan = Donuts.Remote.PostalService.IPostMan
import IMail = Donuts.Remote.PostalService.IMail;
import IPostBox = Donuts.Remote.PostalService.IPostBox;

declare export abstract class PostManBase<TOutgoingData, TIncomingData>
    extends ConditionGroup<IMail<TIncomingData>>
    implements IPostMan<TOutgoingData, TIncomingData> {

    public constructor(operator: Donuts.ConditionalOperator);

    public isDeliverable(incomingMail: IMail<TIncomingData>): boolean;

    public abstract deliverAsync(postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>): Promise<IMail<TOutgoingData>>;
}
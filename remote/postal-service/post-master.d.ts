//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { PostBox } from "./post-box";

import IPostMaster = Donuts.Remote.PostalService.IPostMaster;
import IMail = Donuts.Remote.PostalService.IMail;
import IPostalCarrier = Donuts.Remote.PostalService.IPostalCarrier;
import IPostBox = Donuts.Remote.PostalService.IPostBox;
import IEventEmitter = Donuts.IEventEmitter;

declare export class PostMaster<TOutgoingData, TIncomingData>
    extends PostBox
    implements IPostMaster<TOutgoingData, TIncomingData>, IEventEmitter {

    constructor(log?: Donuts.Logging.ILog, id?: string, moduleName?: string);

    public readonly postboxes: Donuts.IStringKeyDictionary<IPostBox<TOutgoingData, TIncomingData>>;

    public addCarrier(carrier: IPostalCarrier<TOutgoingData, TIncomingData>): this;

    /**
     * Removing a carrier could be costy as it requires to remove all the targets that the source generates before.
     * @param carrier The carrier to be removed.
     * @returns This pipeline.
     */
    public removeCarrier(carrier: IPostalCarrier<TOutgoingData, TIncomingData>): this;
    public getCarriers(): Array<IPostalCarrier<TOutgoingData, TIncomingData>>;

    public preOn(event: "mail", asyncHandler: (postmaster: IPostMaster<TOutgoingData, TIncomingData>, carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>): this;
    public preOnce(event: "mail", asyncHandler: (postmaster: IPostMaster<TOutgoingData, TIncomingData>, carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>): this;
    public on(event: "mail", asyncHandler: (postmaster: IPostMaster<TOutgoingData, TIncomingData>, carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>): this;
    public once(event: "mail", asyncHandler: (postmaster: IPostMaster<TOutgoingData, TIncomingData>, carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>): this;
    public off(event: "mail", asyncHandler: (postmaster: IPostMaster<TOutgoingData, TIncomingData>, carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>): this;
}
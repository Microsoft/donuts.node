//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { PostBox } from "./Postbox";

import OutgoingMailAsyncHandler = Donuts.Remote.PostalService.OutgoingMailAsyncHandler;
import IncomingMailAsyncHandler = Donuts.Remote.PostalService.IncomingMailAsyncHandler;
import IPostMaster = Donuts.Remote.PostalService.IPostMaster;
import IMail = Donuts.Remote.PostalService.IMail;
import IPostalCarrier = Donuts.Remote.PostalService.IPostalCarrier;
import IPostBox = Donuts.Remote.PostalService.IPostBox;
import IEventEmitter = Donuts.IEventEmitter;

declare export class PostMaster<TOutgoingData, TIncomingData>
    extends PostBox
    implements IPostMaster<TOutgoingData, TIncomingData>, IEventEmitter {

    constructor(log: Donuts.Logging.ILog, id?: string, moduleName?: string);

    public readonly postboxes: Donuts.IStringKeyDictionary<IPostBox<TOutgoingData, TIncomingData>>;

    public addCarrier(source: IPostalCarrier<TOutgoingData, TIncomingData>): this;

    /**
     * Removing a carrier could be costy as it requires to remove all the targets that the source generates before.
     * @param source The source to be removed.
     * @returns This pipeline.
     */
    public removeCarrier(source: IPostalCarrier<TOutgoingData, TIncomingData>): this;
    public getCarriers(): Array<IPostalCarrier<TOutgoingData, TIncomingData>>;

    public on(event: "data", handler: (pipeline: ICommunicationPipeline<TOutgoingData, TIncomingData>, incomingData: TIncomingData) => void): this;
    public once(event: "data", handler: (pipeline: ICommunicationPipeline<TOutgoingData, TIncomingData>, incomingData: TIncomingData) => void): this;
    public off(event: "data", handler: (pipeline: ICommunicationPipeline<TOutgoingData, TIncomingData>, incomingData: TIncomingData) => void): this;
}
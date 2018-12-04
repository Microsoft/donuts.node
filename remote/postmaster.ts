//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { CommunicationPipeline } from "./Postbox";
import OutgoingMailAsyncHandler = Donuts.Remote.OutgoingMailAsyncHandler;
import IncomingMailAsyncHandler = Donuts.Remote.IncomingMailAsyncHandler;
import ICommunicationSource = Donuts.Remote.ICommunicationSource;
import IMessage = Donuts.Remote.IMessage;

declare export class MultiSourceCommunicationPipeline<TOutgoingData, TIncomingData>
    extends CommunicationPipeline
    implements Donuts.Remote.IMultiSourceCommunicationPipeline<TOutgoingData, TIncomingData> {

    constructor(log: Donuts.Logging.ILog, id?: string, moduleName?: string);

    private readonly sources: Array<ICommunicationSource>;
    private readonly targets: Donuts.IStringKeyDictionary<OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>>;

    private readonly onincomingMail: (source: ICommunicationSource, incomingMsg: IMessage<TIncomingData>) => void;

    public addSource(source: ICommunicationSource): this;

    /**
     * Removing a source could be costy as it requires to remove all the targets that the source generates before.
     * @param source The source to be removed.
     * @returns This pipeline.
     */
    public removeSource(source: ICommunicationSource): this;
    public getSources(): Array<ICommunicationSource>;

    public setTarget(name: string, target: OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>): this;
    public getTarget(name: string): OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>;
    public getTargets(): Donuts.IStringKeyDictionary<OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>>;

    public on(event: "data", handler: (pipeline: ICommunicationPipeline<TOutgoingData, TIncomingData>, incomingData: TIncomingData) => void): this;
    public once(event: "data", handler: (pipeline: ICommunicationPipeline<TOutgoingData, TIncomingData>, incomingData: TIncomingData) => void): this;
    public off(event: "data", handler: (pipeline: ICommunicationPipeline<TOutgoingData, TIncomingData>, incomingData: TIncomingData) => void): this;
}
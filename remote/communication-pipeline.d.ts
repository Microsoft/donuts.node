//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { EventEmitter } from "donuts.node/event-emitter";
import OutgoingAsyncHandler = Donuts.Remote.OutgoingAsyncHandler;
import IncomingAsyncHandler = Donuts.Remote.IncomingAsyncHandler;
import ICommunicationSource = Donuts.Remote.ICommunicationSource;
import IMessage = Donuts.Remote.IMessage;

declare export class CommunicationPipeline<TOutgoingData, TIncomingData>
    extends EventEmitter
    implements Donuts.Remote.ICommunicationPipeline<TOutMsg, TInMsg> {

    public readonly id: string;
    public readonly outgoingPipe: Array<OutgoingAsyncHandler<TOutgoingData, TIncomingData>>;
    public readonly incomingPipe: Array<IncomingAsyncHandler<TOutgoingData, TIncomingData>>;

    public outgoingDataTemplate: TOutgoingData;

    protected readonly moduleName: string;
    protected readonly log: Donuts.Logging.ILog;

    protected disposed: boolean;

    private readonly sources: Array<ICommunicationSource>;
    private readonly targets: Donuts.IStringKeyDictionary<OutgoingAsyncHandler<TOutgoingData, TIncomingData>>;

    private readonly onIncomingMessage: (source: ICommunicationSource, incomingMsg: IMessage<TIncomingData>) => void;

    public disposeAsync(): Promise<void>;

    public addSource(source: ICommunicationSource): this;
    
    /**
     * Removing a source could be costy as it requires to remove all the targets that the source generates before.
     * @param source The source to be removed.
     * @returns This pipeline.
     */
    public removeSource(source: ICommunicationSource): this;
    public getSources(): Array<ICommunicationSource>;

    public setTarget(name: string, target: OutgoingAsyncHandler<TOutgoingData, TIncommingData>): this;
    public getTarget(name: string): OutgoingAsyncHandler<TOutgoingData, TIncommingData>;
    public getTargets(): Donuts.IStringKeyDictionary<OutgoingAsyncHandler<TOutgoingData, TIncommingData>>;

    public on(event: "data", handler: (pipeline: ICommunicationPipeline<TOutgoingData, TIncommingData>, incomingData: TIncommingData) => void): this;
    public once(event: "data", handler: (pipeline: ICommunicationPipeline<TOutgoingData, TIncommingData>, incomingData: TIncommingData) => void): this;
    public off(event: "data", handler: (pipeline: ICommunicationPipeline<TOutgoingData, TIncommingData>, incomingData: TIncommingData) => void): this;

    public pipeAsync(data: TOutgoingData, target?: string): Promise<TIncommingData>;
}
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { EventEmitter } from "donuts.node/event-emitter";
import OutgoingMailAsyncHandler = Donuts.Remote.OutgoingMailAsyncHandler;
import IncomingMailAsyncHandler = Donuts.Remote.IncomingMailAsyncHandler;
import IMessage = Donuts.Remote.IMessage;

declare export class CommunicationPipeline<TOutgoingData, TIncomingData>
    extends EventEmitter
    implements Donuts.Remote.ICommunicationPipeline<TOutMsg, TInMsg> {

    constructor(log: Donuts.Logging.ILog, id?: string, moduleName?: string);

    public readonly id: string;
    public readonly outgoingPipe: Array<OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>>;
    public readonly incomingPipe: Array<IncomingMailAsyncHandler<TOutgoingData, TIncomingData>>;

    public outgoingDataTemplate: TOutgoingData;

    protected readonly moduleName: string;
    protected readonly log: Donuts.Logging.ILog;

    protected disposed: boolean;

    public disposeAsync(): Promise<void>;

    public pipeAsync(data: TOutgoingData, target?: string): Promise<TIncomingData>;

    protected validateDisposal(): void;
    protected logMessage(message: IMessage<TOutgoingData | TIncomingData>, text?: string, severity?: string): void;
    protected generateoutgoingMail(outgoingData: TOutgoingData): IMessage<TOutgoingData>;

    protected async PipeToIncomingPipeAsync(outgoingMsg: IMessage<TOutgoingData>, incomingMsg: IMessage<TIncomingData>): Promise<IMessage<TIncomingData>>;
    protected async PipeToOutgoingPipeAsync(outgoingMsg: IMessage<TOutgoingData>): Promise<IMessage<TIncomingData>>;
    protected async emitincomingMailAsync(incomingMsg: IMessage<TIncomingData>): Promise<void>;
}
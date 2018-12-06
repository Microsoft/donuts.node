//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import IDisposable = Donuts.IDisposable;
import IMail = Donuts.Remote.PostalService.IMail;
import IPostBox = Donuts.Remote.PostalService.IPostBox;
import OutgoingMailAsyncHandler = Donuts.Remote.PostalService.OutgoingMailAsyncHandler;
import IncomingMailAsyncHandler = Donuts.Remote.PostalService.IncomingMailAsyncHandler;
import { EventEmitter } from "donuts.node/event-emitter";

declare export class PostBox<TOutgoingData, TIncomingData>
    extends EventEmitter
    implements IPostBox<TOutMsg, TInMsg>, IDisposable {
        
    constructor(log?: Donuts.Logging.ILog, id?: string, moduleName?: string);

    public readonly id: string;
    public readonly outgoingPipe: Array<OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>>;
    public readonly incomingPipe: Array<IncomingMailAsyncHandler<TOutgoingData, TIncomingData>>;

    public outgoingMailTemplate: IMail<TOutgoingData>;

    protected readonly moduleName: string;
    protected readonly log: Donuts.Logging.ILog;

    protected disposed: boolean;

    public disposeAsync(): Promise<void>;

    public sendMailAsync(mail: IMail<TOutgoingData>): Promise<IMail<TIncomingData>>;
    public dropMailAsync(mail: IMail<TOutgoingData>): Promise<void>;

    public sendAsync(data: TOutgoingData, to?: URL, type?: string): Promise<TIncomingData>;
    public dropAsync(data: TOutgoingData, to?: URL, type?: string): Promise<void>

    protected validateDisposal(): void;
    protected logMessage(mail: IMail<TOutgoingData | TIncomingData>, text?: string, severity?: string): void;
    protected generateOutgoingMail(outgoingMail: IMail<TOutgoingData>): IMail<TOutgoingData>;

    protected async PipeToIncomingPipeAsync(outgoingMsg: IMail<TOutgoingData>, incomingMsg: IMail<TIncomingData>): Promise<IMail<TIncomingData>>;
    protected async PipeToOutgoingPipeAsync(outgoingMsg: IMail<TOutgoingData>): Promise<IMail<TIncomingData>>;
}
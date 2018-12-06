//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
import IDisposable = Donuts.IDisposable;
import IMail = Donuts.Remote.PostalService.IMail;
import IPostBox = Donuts.Remote.PostalService.IPostBox;
import OutgoingMailAsyncHandler = Donuts.Remote.PostalService.OutgoingMailAsyncHandler;

declare export class SimplePostBox<TOutgoingData, TIncomingData>
    implements IPostBox<TOutMsg, TInMsg>, IDisposable {

    public readonly id: string;

    public outgoingMailTemplate: IMail<TOutgoingData>;

    public constructor(
        outgoingMailAsyncHandler: OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>,
        disposeAsyncHandler?: () => Promise<void>,
        log?: Donuts.Logging.ILog,
        id?: string,
        moduleName?: string);

    public disposeAsync(): Promise<void>;

    public sendMailAsync(mail: IMail<TOutgoingData>): Promise<IMail<TIncomingData>>;
    public dropMailAsync(mail: IMail<TOutgoingData>): Promise<void>;

    public sendAsync(data: TOutgoingData, to?: URL, type?: string): Promise<TIncomingData>;
    public dropAsync(data: TOutgoingData, to?: URL, type?: string): Promise<void>
}
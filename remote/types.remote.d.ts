//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
namespace Donuts.Remote {
    interface ObjectResolver {
        (proxy: IObjectRemotingProxy, name: string, ...extraArgs: Array<any>): Promise<any>;
    }

    interface IObjectRemotingProxy extends IDisposable {
        readonly id: string;

        resolver: ObjectResolver;

        requestAsync<T>(identifier: string, ...extraArgs: Array<any>): Promise<T>;
        releaseAsync(refId: string): Promise<void>;

        applyAsync<T>(refId: string, thisArg: any, args: Array<any>): Promise<T>;
        getPropertyAsync<T>(refId: string, property: string | number): Promise<T>;
        setPropertyAsync(refId: string, property: string | number, value: any): Promise<boolean>;
    }

    interface ISignatureIdentifier {
        type: string;
    }

    interface ICertSignatureIdentifier extends ISignatureIdentifier {
        type: "cert";
    }

    interface IMail<TData> extends Donuts.IStringKeyDictionary {
        id?: string;
        from?: string;
        to?: string;
        type?: string;

        /**
         * In milliseconds.
         */
        timestamp?: number;

        data: TData;

        integrity?: string;
        signature?: string;
        signatureIdentifier?: ISignatureIdentifier;
    }

    interface IPostBoxLike<TOutgoingData, TIncomingData> {
        readonly id: string;

        outgoingMailTemplate: IMail<TOutgoingData>;

        sendAsync(data: TOutgoingData, to?: string, type?: string): Promise<IMail<TIncomingData>>;
        dropAsync(data: TOutgoingData, to?: string, type?: string): Promise<void>;
    }

    interface IPostalCarrier<TOutgoingData, TIncomingData> extends IEventEmitter {
        on(event: "mail", handler: (carrier: IPostalCarrier, postbox: IPostBoxLike<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => IMail<TOutgoingData>);
        once(event: "mail", handler: (carrier: IPostalCarrier, postbox: IPostBoxLike<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => IMail<TOutgoingData>);
        off(event: "mail", handler: (carrier: IPostalCarrier, postbox: IPostBoxLike<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => IMail<TOutgoingData>);

        on(event: "postbox-acquired", handler: (carrier: IPostalCarrier, postbox: IPostBoxLike<TOutgoingData, TIncomingData>) => void);
        once(event: "postbox-acquired", handler: (carrier: IPostalCarrier, postbox: IPostBoxLike<TOutgoingData, TIncomingData>) => void);
        off(event: "postbox-acquired", handler: (carrier: IPostalCarrier, postbox: IPostBoxLike<TOutgoingData, TIncomingData>) => void);

        on(event: "postbox-lost", handler: (carrier: IPostalCarrier, postbox: IPostBoxLike<TOutgoingData, TIncomingData>) => void);
        once(event: "postbox-lost", handler: (carrier: IPostalCarrier, postbox: IPostBoxLike<TOutgoingData, TIncomingData>) => void);
        off(event: "postbox-lost", handler: (carrier: IPostalCarrier, postbox: IPostBoxLike<TOutgoingData, TIncomingData>) => void);
    }

    interface IPostMaster<TOutgoingData, TIncomingData> extends IPostBoxLike<TOutgoingData, TIncomingData> {
        addCarrier(source: IPostalCarrier): this;
        removeCarrier(source: IPostalCarrier): this;
        getCarriers(): Array<IPostalCarrier>;

        setPostBox(name: string, postbox: IPostBoxLike<TOutgoingData, TIncomingData>): this;
        getPostBox(name: string): IPostBoxLike<TOutgoingData, TIncomingData>;
        getPostBoxes(): Donuts.IStringKeyDictionary<IPostBoxLike<TOutgoingData, TIncomingData>>;

        on(event: "mail", asyncHandler: (carrier: IPostalCarrier, postbox: IPostBoxLike<TOutgoingData, TIncomingData>, incomingData: TIncomingData) => Promise<TOutgoingData>): this;
        once(event: "mail", asyncHandler: (carrier: IPostalCarrier, postbox: IPostBoxLike<TOutgoingData, TIncomingData>, incomingData: TIncomingData) => Promise<TOutgoingData>): this;
        off(event: "mail", asyncHandler: (carrier: IPostalCarrier, postbox: IPostBoxLike<TOutgoingData, TIncomingData>, incomingData: TIncomingData) => Promise<TOutgoingData>): this;
    }

    interface IPostMan<TOutgoingData, TIncomingData> {
        isDeliverable(incomingMail: IMail<TIncomingData>): boolean;
        deliver(postbox: IPostBoxLike<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>): Promise<TOutgoingData>;
    }

    interface IPostOffice<TOutgoingData, TIncomingData> extends IPostMaster<TOutgoingData, TIncomingData> {
        readonly postmans: Array<IPostMan<TIncomingData>>;
    }

    interface OutgoingMailAsyncHandler<TOutgoingData, TIncomingData> {
        (postbox: IPostBoxLike<TOutgoingData, TIncomingData>, outgoingMsg: IMail<TOutgoingData>): Promise<IMail<TIncomingData>>;
    }

    interface IncomingMailAsyncHandler<TOutgoingData, TIncomingData> {
        (postbox: IPostBoxLike<TOutgoingData, TIncomingData>, outgoingMsg: IMail<TOutgoingData>, incomingMsg: IMail<TIncomingData>): Promise<IMail<TIncomingData>>;
    }

    interface IPostBox<TOutgoingData, TIncomingData> extends IPostBoxLike<TOutgoingData, TIncomingData>, IDisposable {
        readonly outgoingPipe: Array<OutgoingMailAsyncHandler<TOutgoingData, TIncomingData>>;
        readonly incomingPipe: Array<IncomingMailAsyncHandler<TOutgoingData, TIncomingData>>;
    }
}
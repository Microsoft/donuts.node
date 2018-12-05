//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts.Remote.PostalService {
    interface IMail<TData> extends Donuts.IStringKeyDictionary<any> {
        id?: string;
        from?: URL;
        to?: URL;
        type?: string;

        /**
         * In milliseconds.
         */
        timestamp?: number;

        data: TData;
    }

    interface IPostBox<TOutgoingData, TIncomingData> extends IEventEmitter {
        readonly id: string;

        outgoingMailTemplate: IMail<TOutgoingData>;

        sendMailAsync(mail: IMail<TOutgoingData>): Promise<IMail<TIncomingData>>;
        dropMailAsync(mail: IMail<TOutgoingData>): Promise<void>;
    }

    interface IPostalCarrier<TOutgoingData, TIncomingData> extends IEventEmitter {
        on(event: "mail", asyncHandler: (carrier: IPostalCarrier, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<void>);
        once(event: "mail", asyncHandler: (carrier: IPostalCarrier, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<void>);
        off(event: "mail", asyncHandler: (carrier: IPostalCarrier, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<void>);

        on(event: "postbox-acquired", handler: (carrier: IPostalCarrier, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
        once(event: "postbox-acquired", handler: (carrier: IPostalCarrier, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
        off(event: "postbox-acquired", handler: (carrier: IPostalCarrier, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);

        on(event: "postbox-lost", handler: (carrier: IPostalCarrier, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
        once(event: "postbox-lost", handler: (carrier: IPostalCarrier, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
        off(event: "postbox-lost", handler: (carrier: IPostalCarrier, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
    }

    interface IPostMaster<TOutgoingData, TIncomingData> extends IPostBox<TOutgoingData, TIncomingData>, IEventEmitter {
        addCarrier(source: IPostalCarrier<TOutgoingData, TIncomingData>): this;
        removeCarrier(source: IPostalCarrier<TOutgoingData, TIncomingData>): this;
        getCarriers(): Array<IPostalCarrier<TOutgoingData, TIncomingData>>;

        readonly postboxes: Donuts.IStringKeyDictionary<IPostBox<TOutgoingData, TIncomingData>>;

        on(event: "mail", asyncHandler: (carrier: IPostalCarrier, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<void>): this;
        once(event: "mail", asyncHandler: (carrier: IPostalCarrier, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<void>): this;
        off(event: "mail", asyncHandler: (carrier: IPostalCarrier, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<void>): this;
    }

    interface IPostMan<TOutgoingData, TIncomingData> {
        isDeliverable(incomingMail: IMail<TIncomingData>): boolean;
        deliver(postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>): Promise<IMail<TOutgoingData>>;
    }

    interface IPostOffice<TOutgoingData, TIncomingData> extends IPostMaster<TOutgoingData, TIncomingData> {
        readonly postmans: Array<IPostMan<TIncomingData>>;
    }

    type OutgoingMailAsyncHandler<TOutgoingData, TIncomingData> = (postbox: IPostBox<TOutgoingData, TIncomingData>, outgoingMsg: IMail<TOutgoingData>) => Promise<IMail<TIncomingData>>;
    type IncomingMailAsyncHandler<TOutgoingData, TIncomingData> = (postbox: IPostBox<TOutgoingData, TIncomingData>, outgoingMsg: IMail<TOutgoingData>, incomingMsg: IMail<TIncomingData>) => Promise<IMail<TIncomingData>>;
}
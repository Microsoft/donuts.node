//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts.Remote.PostalService {
    interface IMail<TData> extends Donuts.IStringKeyDictionary<any> {
        /**
         * Conversation ID, identifies the conversation.
         */
        cid?: string;

        /**
         * Mail ID, identifies this mail.
         */
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

    interface IPostBox<TOutgoingData, TIncomingData> {
        readonly id: string;

        outgoingMailTemplate: IMail<TOutgoingData>;

        sendMailAsync(mail: IMail<TOutgoingData>): Promise<IMail<TIncomingData>>;
        dropMailAsync(mail: IMail<TOutgoingData>): Promise<void>;
    }

    interface IPostalCarrier<TOutgoingData, TIncomingData> extends IEventEmitter {
        preOn(event: "mail", asyncHandler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
        preOnce(event: "mail", asyncHandler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
        on(event: "mail", asyncHandler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
        once(event: "mail", asyncHandler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
        off(event: "mail", asyncHandler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);

        preOn(event: "postbox-acquired", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
        preOnce(event: "postbox-acquired", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
        on(event: "postbox-acquired", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
        once(event: "postbox-acquired", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
        off(event: "postbox-acquired", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);

        preOn(event: "postbox-lost", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
        preOnce(event: "postbox-lost", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
        on(event: "postbox-lost", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
        once(event: "postbox-lost", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
        off(event: "postbox-lost", handler: (carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>) => void);
    }

    interface IPostMaster<TOutgoingData, TIncomingData> extends IPostBox<TOutgoingData, TIncomingData>, IEventEmitter {
        addCarrier(carrier: IPostalCarrier<TOutgoingData, TIncomingData>): this;
        removeCarrier(carrier: IPostalCarrier<TOutgoingData, TIncomingData>): this;
        getCarriers(): Array<IPostalCarrier<TOutgoingData, TIncomingData>>;

        /**
         * The postboxes mapped with the origin of the to field.
         */
        readonly postboxes: Donuts.IStringKeyDictionary<IPostBox<TOutgoingData, TIncomingData>>;

        preOn(event: "mail", asyncHandler: (postmaster: IPostMaster<TOutgoingData, TIncomingData>, carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>): this;
        preOnce(event: "mail", asyncHandler: (postmaster: IPostMaster<TOutgoingData, TIncomingData>, carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>): this;
        on(event: "mail", asyncHandler: (postmaster: IPostMaster<TOutgoingData, TIncomingData>, carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>): this;
        once(event: "mail", asyncHandler: (postmaster: IPostMaster<TOutgoingData, TIncomingData>, carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>): this;
        off(event: "mail", asyncHandler: (postmaster: IPostMaster<TOutgoingData, TIncomingData>, carrier: IPostalCarrier<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>): this;
    }

    interface IPostMan<TOutgoingData, TIncomingData> {
        isDeliverable(incomingMail: IMail<TIncomingData>): boolean;
        deliverAsync(postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>): Promise<IMail<TOutgoingData>>;
    }

    interface IPostOffice<TOutgoingData, TIncomingData> extends IPostMaster<TOutgoingData, TIncomingData> {
        readonly postmans: Array<IPostMan<TOutgoingData, TIncomingData>>;
    }

    type OutgoingMailAsyncHandler<TOutgoingData, TIncomingData> = (postbox: IPostBox<TOutgoingData, TIncomingData>, outgoingMail: IMail<TOutgoingData>) => Promise<IMail<TIncomingData>>;
    type IncomingMailAsyncHandler<TOutgoingData, TIncomingData> = (postbox: IPostBox<TOutgoingData, TIncomingData>, outgoingMail: IMail<TOutgoingData>, incomingMsg: IMail<TIncomingData>) => Promise<IMail<TIncomingData>>;
}
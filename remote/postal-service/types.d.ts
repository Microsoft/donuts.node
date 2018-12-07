//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts.Remote.PostalService {
    interface IMail<TData> {
        /**
         * Mail ID, identifies this mail.
         */
        id: string;
        to: URL;
        /**
         * In milliseconds.
         */
        timestamp: number;
        data: TData;

        /**
         * Conversation ID, identifies the conversation.
         */
        cid?: string;
        from?: URL;
        type?: string;

        metadata?: Donuts.IStringKeyDictionary<any>;
    }

    interface IPostBox<TOutgoingData, TIncomingData> extends IEventEmitter {
        readonly origin: string;

        sendMailAsync(mail: IMail<TOutgoingData>): Promise<IMail<TIncomingData>>;
        dropMail(mail: IMail<TOutgoingData>): void;

        preOn(event: "mail", asyncHandler: (postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
        preOnce(event: "mail", asyncHandler: (postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
        on(event: "mail", asyncHandler: (postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
        once(event: "mail", asyncHandler: (postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
        off(event: "mail", asyncHandler: (postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
    }

    interface IPostalCarrier<TOutgoingData, TIncomingData> extends IEventEmitter {
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

        acquirePostBox(mail: IMail<TOutgoingData>): IPostBox<TOutgoingData, TIncomingData>;
    }

    interface IPostOfficeError extends Error {
        mail?: IMail<any>;
        postbox?: IPostBox<any, any>;
        carrier?: IPostalCarrier<any, any>;
        postOffice?: IPostOffice<any, any>;
        code?: string;
    }

    interface IPostOffice<TOutgoingData, TIncomingData> extends IEventEmitter {
        addCarrier(carrier: IPostalCarrier<TOutgoingData, TIncomingData>): this;
        removeCarrier(carrier: IPostalCarrier<TOutgoingData, TIncomingData>): this;

        addPostBox(postbox: IPostBox<TOutgoingData, TIncomingData>): this;
        removePostBox(postbox: IPostBox<TOutgoingData, TIncomingData>): this;

        preOn(event: "error", handler: (postOffice: IPostOffice<TOutgoingData, TIncomingData>, error: IPostOfficeError) => void);
        preOnce(event: "error", handler: (postOffice: IPostOffice<TOutgoingData, TIncomingData>, error: IPostOfficeError) => void);
        on(event: "error", handler: (postOffice: IPostOffice<TOutgoingData, TIncomingData>, error: IPostOfficeError) => void);
        once(event: "error", handler: (postOffice: IPostOffice<TOutgoingData, TIncomingData>, error: IPostOfficeError) => void);
        off(event: "error", handler: (postOffice: IPostOffice<TOutgoingData, TIncomingData>, error: IPostOfficeError) => void);
    }

    interface IPostMan<TOutgoingData, TIncomingData> {
        createPostBox(origin: string): IPostBox<TOutgoingData, TIncomingData>;
        getAllPostBoxes(): Array<IPostBox<TOutgoingData, TIncomingData>>;

        addMailSlot(slotName: string, condition: ICondition<IMail<TIncomingData>>, mailSlotAsyncHandler: (mail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>): this;
        removeMailSlot(slotName: string): this;
    }
}
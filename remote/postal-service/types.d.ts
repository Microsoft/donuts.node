//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts.Remote.PostalService {
    interface OutgoingMailAsyncHandler<TOutgoingData, TIncomingData> {
        (postbox: IPostBox<TOutgoingData, TIncomingData>, outgoingMail: IMail<TOutgoingData>): Promise<IMail<TIncomingData>>;
    }

    interface IncomingMailAsyncHandler<TOutgoingData, TIncomingData> {
        (postbox: IPostBox<TOutgoingData, TIncomingData>, outgoingMail: IMail<TOutgoingData>, incomingMail: IMail<TIncomingData>): Promise<IMail<TIncomingData>>;
    }

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
        readonly location?: URL;

        sendMailAsync(mail: IMail<TOutgoingData>): Promise<IMail<TIncomingData>>;
        dropMail(mail: IMail<TOutgoingData>): void;

        deliverMailAsync(mail: IMail<TIncomingData>): Promise<IMail<TOutgoingData>>;

        preOn(event: "mail", asyncHandler: (emitter: this, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
        preOnce(event: "mail", asyncHandler: (emitter: this, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
        on(event: "mail", asyncHandler: (emitter: this, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
        once(event: "mail", asyncHandler: (emitter: this, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);
        off(event: "mail", asyncHandler: (emitter: this, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>);

        preOn(event: "error", handler: (emitter: this, error: IPostError) => void);
        preOnce(event: "error", handler: (emitter: this, error: IPostError) => void);
        on(event: "error", handler: (emitter: this, error: IPostError) => void);
        once(event: "error", handler: (emitter: this, error: IPostError) => void);
        off(event: "error", handler: (emitter: this, error: IPostError) => void);
    }

    interface IPostalCarrier<TOutgoingData, TIncomingData> extends IEventEmitter {
        isSendable(mail: IMail<TOutgoingData>): boolean;
    }

    interface IPostOffice<TOutgoingData, TIncomingData> extends IPostalCarrier {
        addCarrier(carrier: IPostalCarrier<TOutgoingData, TIncomingData>): this;
        removeCarrier(carrier: IPostalCarrier<TOutgoingData, TIncomingData>): this;

        addPostBox(postbox: IPostBox<TOutgoingData, TIncomingData>): this;
        removePostBox(postbox: IPostBox<TOutgoingData, TIncomingData>): this;
    }

    interface IPostalError extends Error {
        mail?: IMail<any>;
        postbox?: IPostBox<any, any>;
        carrier?: IPostalCarrier<any, any>;
        postOffice?: IPostOffice<any, any>;
        code?: string;
    }
}
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts.Remote.PostalService {
    interface OutgoingMailAsyncHandler {
        (postbox: IPostBox, outgoingMail: IMail<any>): Promise<IMail<any>>;
    }

    interface IncomingMailAsyncHandler {
        (postbox: IPostBox, outgoingMail: IMail<any>, incomingMail: IMail<any>): Promise<IMail<any>>;
    }

    interface IMail<TData> extends IMailMetadata {
        /**
         * Mail ID, identifies this mail.
         */
        id: string;

        /**
         * Conversation ID, identifies the conversation.
         */
        cid?: string;

        to: URL;
        from?: URL;

        /**
         * In milliseconds.
         */
        sentTime: number;

        /**
         * In milliseconds.
         */
        receivedTime: number;
        
        metadata?: Donuts.IStringKeyDictionary<any>;       

        data?: TData
    }

    interface IPostBox {
        readonly outgoingMailTemplate: IMail<any>;
        readonly outgoingPipe: Array<OutgoingMailAsyncHandler>;
        readonly incomingPipe: Array<IncomingMailAsyncHandler>;

        readonly id: string;
        readonly location?: URL;

        sendMailAsync<TIncomingData>(mail: IMail<any>): Promise<IMail<TIncomingData>>;
        dropMail(mail: IMail<any>): void;

        deliverMailAsync(mail: IMail<any>): Promise<IMail<any>>;

        preOn(event: "mail", asyncHandler: (emitter: this, incomingMail: IMail<any>) => Promise<IMail<any>>);
        preOnce(event: "mail", asyncHandler: (emitter: this, incomingMail: IMail<any>) => Promise<IMail<any>>);
        on(event: "mail", asyncHandler: (emitter: this, incomingMail: IMail<any>) => Promise<IMail<any>>);
        once(event: "mail", asyncHandler: (emitter: this, incomingMail: IMail<any>) => Promise<IMail<any>>);
        off(event: "mail", asyncHandler: (emitter: this, incomingMail: IMail<any>) => Promise<IMail<any>>);

        preOn(event: "error", handler: (emitter: this, error: IPostError) => void);
        preOnce(event: "error", handler: (emitter: this, error: IPostError) => void);
        on(event: "error", handler: (emitter: this, error: IPostError) => void);
        once(event: "error", handler: (emitter: this, error: IPostError) => void);
        off(event: "error", handler: (emitter: this, error: IPostError) => void);
    }

    interface IPostalError extends Error {
        mail?: IMail<any>;
        emitter?: IPostBox;
        code?: string;
    }
}
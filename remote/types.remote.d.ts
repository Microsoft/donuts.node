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

    interface IMessageTransmitter<TRequest, TResponse> {
        sendAsync(request: TRequest): Promise<TResponse>;

        // on(event: "message-sending", handler: (request: TRequest) => TRequest);
        // on(event: "message-sent", handler: (request: TRequest) => void);
        on(event: "message-received", handler: (response: TResponse) => TResponse);
        off(event: "message-received", handler: (response: TResponse) => TResponse);
        once(event: "message-received", handler: (response: TResponse) => TResponse);
    }

    interface TMessageProcessor<TInMessage, TOutMessage> {
        handleAsync(msg: TInMessage): Promise<TOutMessage>;
    }

    interface ICommunicator<TOutgoingMessage, TRequest, TResponse, TIncomingMessage> {
        sendMessageAsync(msg: TOutgoingMessage): Promise<TIncomingMessage>;

        outgoingMessageProcessors: Array<IMessageProcessor<TOutgoingMessage, TRequest>>;
        incomingMessageProcessors: Array<IMessageProcessor<TResponse, TIncomingMessage>>;
        messageTransmitter: IMessageTransmitter<TRequest, TResponse>;
    }
}
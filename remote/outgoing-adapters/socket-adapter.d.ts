//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { EventEmitter } from "donuts.node/event-emitter";

import IMessage = Donuts.Remote.IMessage;
import ICommunicationPipeline = Donuts.Remote.ICommunicationPipeline;
import ICommunicationListener = Donuts.Remote.ICommunicationSource;

declare export class SocketAdapter
    extends EventEmitter
    implements ICommunicationListener {
    
    handleOutgoingMessage(pipeline: ICommunicationPipeline<TOutgoingData, TIncommingData>, outgoingMsg: IMessage<TOutgoingData>): Promise<IMessage<TIncommingData>>;
}
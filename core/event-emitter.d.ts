//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export class EventEmitter implements Donuts.IEventEmitter {
    public on(event: string, handler: (...args: Array<any>) => void): this;
    public once(event: string, handler: (...args: Array<any>) => void): this;
    public off(event: string, handler: (...args: Array<any>) => void): this;
    public emit(event: string, ...args: Array<any>): this;
}
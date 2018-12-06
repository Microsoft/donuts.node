//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export class EventEmitter implements Donuts.IEventEmitter {
    public preOn(event: string, handler: (...args: Array<any>) => any): this;
    public preOnce(event: string, handler: (...args: Array<any>) => any): this;
    public on(event: string, handler: (...args: Array<any>) => any): this;
    public once(event: string, handler: (...args: Array<any>) => any): this;
    public off(event: string, handler: (...args: Array<any>) => any): this;
    public emit(event: string, ...args: Array<any>): any;
}
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

export type FunctionType = (...args: Array<any>) => any;

export interface IDictionary<TValue> {
    [key: string]: TValue;
}

export interface IDisposable {
    disposeAsync(): Promise<void>;
}

export interface IAsyncHandlerConstructor<THandler extends FunctionType> {
    (nextHandler: THandler): Promise<THandler>;
}

export interface IHandlerChainBuilder<THandler extends FunctionType> {
    handleAsync(constructor: IAsyncHandlerConstructor<THandler>): Promise<IHandlerChainBuilder<THandler>>;
    buildAsync(): Promise<THandler>;
}

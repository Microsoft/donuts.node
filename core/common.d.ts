//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare type FunctionType = (...args: Array<any>) => any;

declare interface IDictionary<TValue> {
    [key: string]: TValue;
}

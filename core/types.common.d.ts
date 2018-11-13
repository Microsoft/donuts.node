//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts {
    type FunctionType = (...args: Array<any>) => any;

    interface IStringKeyDictionary<TValue> {
        [index: string]: TValue;
    }

    interface INumberKeyDictionary<TValue> {
        [index: number]: TValue;
    }

    interface ISymbolKeyDictionary<TValue> {
        [index: symbol]: TValue;
    }

    interface IDisposable {
        disposeAsync(): Promise<void>;
    }
}
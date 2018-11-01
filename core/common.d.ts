//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts {
    type FunctionType = (...args: Array<any>) => any;

    interface IDisposable {
        disposeAsync(): Promise<void>;
    }
}
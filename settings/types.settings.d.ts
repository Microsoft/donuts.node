//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts.Settings {
    interface ISettings {
        getAsync<T>(settingPath: string): Promise<T>;

        setAsync<T>(settingPath: string, value: T): Promise<void>;
    }
}
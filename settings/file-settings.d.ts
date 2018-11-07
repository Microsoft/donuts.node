//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { Settings } from "./settings";

declare export class FileSettings extends Settings {
    protected readonly settings: Donuts.IDictionary<string, any>;

    constructor(settingsPath: string, readOnly?: boolean, parentSettings?: Donuts.Settings.ISettings);
}
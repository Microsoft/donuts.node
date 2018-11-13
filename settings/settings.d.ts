//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export class Settings implements Donuts.Settings.ISettings {
    public readonly readonly: boolean;
    
    protected readonly settings: Donuts.IStringKeyDictionary<any>;

    constructor(initialSettings?: Donuts.IStringKeyDictionary<any>, readonly?: boolean, parentSettings?: Donuts.Settings.ISettings);

    public getAsync<T>(settingPath: string): Promise<T>;

    public setAsync<T>(settingPath: string, value: T): Promise<void>;
}
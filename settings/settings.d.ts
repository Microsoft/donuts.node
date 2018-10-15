//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare module "donut.node/settings" {
    export interface ISettings {
        getAsync<T>(settingPath: string): Promise<T>;

        setAsync<T>(settingPath: string, value: T): Promise<void>;
    }

    export interface ISettingsService {
        readonly default: Promise<ISettings>;

        openAsync(...names: Array<string>): Promise<ISettings>;
    }
}

declare module "donut.node/module-manager" {
    import { ISettingsService, ISettings } from "donut.node/settings";

    export interface IModuleManager {
        getComponentAsync(componentIdentity: "settings.service"): Promise<ISettingsService>;
        getComponentAsync(componentIdentity: "settings"): Promise<ISettings>;
    }
}

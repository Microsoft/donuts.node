//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IModule, IModuleInfo } from "donut.node/module-manager";
import { ISettingsService, ISettings } from "donut.node/settings";

import * as appUtils from "../../utilities/appUtils";

(<IModule>exports).getModuleMetadata = (components): IModuleInfo => {
    components
        .register<ISettingsService>({
            name: "settings.service",
            version: appUtils.getAppVersion(),
            singleton: true,
            descriptor: () => import("./settings-service").then((module) => new module.default())
        })
        .register<ISettings>({
            name: "settings",
            version: appUtils.getAppVersion(),
            singleton: true,
            descriptor: async (settingsSvc: ISettingsService) => settingsSvc.default,
            deps: ["settings.service"]
        });

    return {
        name: "settings",
        version: appUtils.getAppVersion()
    };
};

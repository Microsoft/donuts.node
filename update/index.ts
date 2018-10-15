//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IModuleInfo, IModule } from "donut.node/module-manager";
import { IUpdateService } from "donut.node/update";
import { ISettings } from "donut.node/settings";
import { ILog } from "donut.node/logging";
import { IHttpClient } from "donut.node/http";
import { IUpdateSettings } from "./update";

import * as appUtils from "../../utilities/appUtils";

(<IModule>exports).getModuleMetadata = (components): IModuleInfo => {
    components.register<IUpdateService>({
        name: "update",
        version: appUtils.getAppVersion(),
        singleton: true,
        descriptor:
            async (log: ILog, settings: ISettings, httpsClient: IHttpClient) =>
                settings.getAsync<IUpdateSettings>("update")
                    .then((updateSettings) => import("./update").then((module) => new module.default(log, updateSettings, httpsClient))),
        deps: ["logging", "settings", "http.http-client"]
    });

    return {
        name: "update",
        version: appUtils.getAppVersion()
    };
};

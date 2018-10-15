//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare module "donut.node/update" {
    import { IVersionInfo } from "donut.node/common";

    export interface IUpdateService {
        updateAsync(): Promise<void>;

        requestVersionInfoAsync(): Promise<IVersionInfo>;
    }
}

declare module "donut.node/module-manager" {
    import { IUpdateService } from "donut.node/update";

    export interface IModuleManager {
        getComponentAsync(componentIdentity: "update"): Promise<IUpdateService>;
    }
}

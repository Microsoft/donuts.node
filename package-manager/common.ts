//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IPackageRepositoryConfig } from "donut.node/package-manager";
import { IDictionary } from "donut.node/common";

export interface IPackageConfig {
    enabled: boolean;
}

export interface IPackageManagerConfig {
    packagesDir: string;
    repos: IDictionary<IPackageRepositoryConfig>;
    packages: IDictionary<IPackageConfig>;
}

export const PackageManagerSettingsName = "package-manager";

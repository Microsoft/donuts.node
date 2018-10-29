//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare interface PackageJson {
    homepage: string;
    "weak-reference.node": {
        version: string;
    }
}

declare interface BindingGyp {
    targets: Array<{
        target_name: string;
        sources: Array<string>;
        include_dirs: Array<string>;
    }>;
}

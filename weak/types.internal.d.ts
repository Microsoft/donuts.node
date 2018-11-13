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

declare interface NativeWeakReferenceModule {
    /**
     * Create a native weak reference.
     * @param target The target object to pointing to.
     * @returns The native weak reference pointing to the target object;
     */
    create<T = object>(target: T): Donuts.Weak.NativeWeakReference<T>
}
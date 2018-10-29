//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/// <reference path="./@types/common.d.ts" />
/// <reference path="./@types/weak-reference.native.d.ts" />
/// <reference path="./@types/weak-reference.d.ts" />

declare interface IModule {
    /**
     * Create a native weak reference pointing to the target object.
     * @param {T} target The target object to point to.
     * @returns {NativeWeakReference<T>} The native weak reference object pointing to the target object.
     */
    createNative<T = object>(target: T): NativeWeakReference<T>;

    /**
     * Create a weak reference pointing to the target object.
     * @param {T} target The target object to point to.
     * @returns {WeakReference<T>} The weak reference object pointing to the target object.
     */
    create<T = object>(target: T): WeakReference<T>;
}

declare var exportModule: IModule;
declare export = exportModule;
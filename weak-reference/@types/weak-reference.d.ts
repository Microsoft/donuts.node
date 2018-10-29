//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare interface WeakReference<T = object> extends NodeJS.EventEmitter {
    /**
     * Check if the target object is dead or not.
     * @returns True if the target is dead. Otherwise, false.
     */
    isDead(): boolean;

    /**
     * Create a strong reference to the target object.
     * @returns The strong reference to the target object if the target is alive. Otherwise, undefined.
     */
    ref(): T;

    on(event: "died", listener: (weakReference: WeakReference<T>) => void): this;
    once(event: "died", listener: (weakReference: WeakReference<T>) => void): this;
    off(event: "died", listener: (weakReference: WeakReference<T>) => void): this;
}
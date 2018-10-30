//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts.Weak {
    interface WeakReference<T = object> extends NodeJS.EventEmitter {
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

    interface NativeWeakReference<T = object> {
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
    
        /**
         * Set a watcher to watch whether the target object is dead.
         * @param watcher The handler to callback when the target object is dead.
         * @returns The weak reference itself.
         */
        setWatcher(watcher: (weakRef: WeakReference<T>) => void): this;
    }
}

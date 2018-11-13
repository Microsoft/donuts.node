//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/// <reference path="types.weak.d.ts" />

/**
 * Create a native weak reference pointing to the target object.
 * @param {T} target The target object to point to.
 * @returns {Donuts.Weak.NativeWeakReference<T>} The native weak reference object pointing to the target object.
 */
declare export function createNative<T = object>(target: T): Donuts.Weak.NativeWeakReference<T>;

/**
 * Create a weak reference pointing to the target object.
 * @param {T} target The target object to point to.
 * @returns {Donuts.Weak.WeakReference<T>} The weak reference object pointing to the target object.
 */
declare export function create<T = object>(target: T): Donuts.Weak.WeakReference<T>;

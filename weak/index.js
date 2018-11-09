//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/** @type {NativeWeakReferenceModule} */
// @ts-ignore
const weakReference = require(`./weak-reference.${process.platform}.${process.arch}`);
const { EventEmitter } = require("events");

/**
 * Interval in ms for checking death.
 * @type {number}
 */
const CheckDeathInterval = 300;

/**
 * @template {object} T
 * @implements {Donuts.Weak.WeakReference.<T>}
 */
class WeakReferenceImpl extends EventEmitter {
    /**
     * 
     * @param {Donuts.Weak.NativeWeakReference.<T>} nativeWeakRef 
     */
    constructor(nativeWeakRef) {
        super();

        this.nativeWeakRef = nativeWeakRef;

        /** 
         * @private
         * @returns {void}
         */
        this.onCheckDeath = () => {
            if (this.nativeWeakRef.isDead()) {
                this.emit("died", this);

            } else {
                setTimeout(this.onCheckDeath, CheckDeathInterval);
            }
        };

        setTimeout(this.onCheckDeath, CheckDeathInterval);
    }

    /**
     * @returns {boolean}
     */
    isDead() {
        return this.nativeWeakRef.isDead();
    }

    /**
     * @returns {T}
     */
    ref() {
        return this.nativeWeakRef.ref();
    }
}

/**
 * @template {object} T
 * Create a native weak reference pointing to the target object.
 * @param {object} target The target object to point to.
 * @returns {Donuts.Weak.NativeWeakReference<T>} The native weak reference object pointing to the target object.
 */
exports.createNative = (target) => weakReference.create(target);

/**
 * @template {object} T
 * Create a weak reference pointing to the target object.
 * @param {object} target The target object to point to.
 * @returns {Donuts.Weak.WeakReference<T>} The weak reference object pointing to the target object.
 */
exports.create = (target) => new WeakReferenceImpl(exports.createNative(target));
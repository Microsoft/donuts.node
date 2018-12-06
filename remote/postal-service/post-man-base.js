//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.IPostMan<TOutgoingData, TIncomingData>} IPostMan
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.IPostBox<TOutgoingData, TIncomingData>} IPostBox
 */

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail
 */

/**
 * @template T
 * @typedef {import("donuts.node/condition-group").ConditionGroup<T>} ConditionGroup
 */

const { ConditionGroup } = require("donuts.node/condition-group");

/**
 * @class
 * @template TOutgoingData, TIncomingData
 * @abstract
 * @extends {ConditionGroup<IMail<TIncomingData>>}
 * @implements {IPostMan<TOutgoingData, TIncomingData>}
 */
class PostManBase extends ConditionGroup {
    /**
     * @public
     * @param {Donuts.ConditionalOperator} operator 
     */
    constructor(operator) {
        super(operator);
    }

    /**
     * @public
     * @param {IMail<TIncomingData>} incomingMail 
     * @returns {boolean}
     */
    isDeliverable(incomingMail) {
        return this.match(incomingMail);
    }

    /**
     * 
     * @param {IPostBox<TOutgoingData, TIncomingData>} postbox 
     * @param {IMail<TIncomingData>} incomingMail 
     * @returns {Promise<IMail<TOutgoingData>>}
     */
    deliverAsync(postbox, incomingMail) {
        throw new Error("Not implemented.");
    }
}
exports.PostManBase = PostManBase;
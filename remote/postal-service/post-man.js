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

const { PostManBase } = require("./post-man-base");

/**
 * @class
 * @template TOutgoingData, TIncomingData
 * @extends {PostManBase<TOutgoingData, TIncomingData>}
 */
class PostMan extends PostManBase {
    /**
     * @public
     * @param {Donuts.ConditionalOperator} operator 
     * @param {(postman: IPostMan<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>} mailAsyncHandler
     */
    constructor(operator, mailAsyncHandler) {
        if (typeof mailAsyncHandler !== "function") {
            throw new Error("mailAsyncHandler must be a function.");
        }

        super(operator);

        /**
         * @private
         * @readonly
         * @type {(postman: IPostMan<TOutgoingData, TIncomingData>, postbox: IPostBox<TOutgoingData, TIncomingData>, incomingMail: IMail<TIncomingData>) => Promise<IMail<TOutgoingData>>}
         */
        this.ayncHandler = mailAsyncHandler;
    }

    /**
     * 
     * @param {IPostBox<TOutgoingData, TIncomingData>} postbox 
     * @param {IMail<TIncomingData>} incomingMail 
     * @returns {Promise<IMail<TOutgoingData>>}
     */
    deliverAsync(postbox, incomingMail) {
        return this.ayncHandler(this, postbox, incomingMail);
    }
}
exports.PostMan = PostMan;
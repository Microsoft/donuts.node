//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { PostMaster } = require("./post-master");

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.IPostOffice<TOutgoingData, TIncomingData>} IPostOffice
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {Donuts.Remote.PostalService.IPostMan<TOutgoingData, TIncomingData>} IPostMan
 */

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail
 */

/**
 * @template TOutgoingData, TIncomingData
 * @typedef {import("./post-master").PostMaster<TOutgoingData, TIncomingData>} PostMaster
 */

/**
 * @class
 * @template TOutgoingData, TIncomingData
 * @extends {PostMaster<TOutgoingData, TIncomingData>}
 * @implements {IPostOffice<TOutgoingData, TIncomingData>}
 */
class PostOffice extends PostMaster {
    /**
     * @public
     * @param {Donuts.Logging.ILog} [log]
     * @param {string} [id]
     * @param {string} [moduleName]
     */
    constructor(log, id, moduleName) {
        super(log, id, moduleName);

        /**
         * @public
         * @readonly
         * @type {Array<IPostMan<TOutgoingData, TIncomingData>>}
         */
        this.postmans = [];

        this.on("mail",
            /**
             * @param postmaster
             * @param carrier
             * @param postbox
             * @param incomingMail
             * @returns {Promise<IMail<TOutgoingData>>}
             */
            async (postmaster, carrier, postbox, incomingMail) => {
                for (const postman of this.postmans) {
                    if (postman.isDeliverable(incomingMail)) {
                        const result = await postman.deliverAsync(postbox, incomingMail);

                        if (result !== undefined) {
                            return result;
                        }
                    }
                }

                return undefined;
            });
    }
}
exports.PostOffice = PostOffice;
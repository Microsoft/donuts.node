//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail 
 */

/** @typedef {import("./postal").Postal} Postal */
/** @typedef {import("./post-office").PostOffice} PostOffice */

const { Postal } = require("./postal");

/**
 * @class
 * @extends {Postal}
 */
class Postbox extends Postal {
    /**
     * @public
     * @param {PostOffice} postOffice
     * @param {URL} [location]
     */
    constructor(postOffice, location) {
        super(location);

        /**
         * @public
         * @readonly
         * @type {PostOffice}
         */
        this.postOffice = postOffice;
    }

    /**
     * @protected
     * @abstract
     * @param {IMail<any>} outgoingMail
     * @returns {Promise<IMail<any>>}
     */
    doSendMailAsync(outgoingMail) {
        return this.postOffice.sendMailAsync(outgoingMail);
    }

    /**
     * @protected
     * @abstract
     * @param {IMail<any>} outgoingMail
     * @returns {void}
     */
    doDropMail(outgoingMail) {
        this.postOffice.dropMail(outgoingMail);
    }
}
exports.Postbox = Postbox;
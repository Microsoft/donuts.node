//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/**
 * @template TData
 * @typedef {Donuts.Remote.PostalService.IMail<TData>} IMail
 */

/** @typedef {Donuts.Remote.PostalService.IPostBox} IPostBox */

/** @typedef {import("./postal").Postal} Postal */
/** @typedef {import("./post-carrier").PostCarrier} PostCarrier */

const { Postal } = require("./postal");
const { PostCarrier } = require("./post-carrier");

/**
 * @class
 * @extends {Postal}
 */
class PostOffice extends Postal {
    /**
     * @public
     * @param {URL} [location]
     */
    constructor(location) {
        super(location);

        /**
         * @protected
         * @readonly
         * @type {Map<string | RegExp, PostCarrier>}
         */
        this.carrierMap = new Map();

        /**
         * @protected
         * @readonly
         * @type {Map<string | RegExp, IPostBox>}
         */
        this.postboxMap = new Map();
    }

    /**
     * @public
     * @returns {Iterable<IPostBox>}
     */
    postBoxes() {
        return this.postboxMap.values();
    }

    /**
     * @public
     * @param {IPostBox} postbox
     * @returns {this}
     */
    addPostBox(postbox) {
        if (!postbox) {
            throw new Error("postbox must be provided.");
        }

        this.validateDisposal();

        const keys = this.generateMapKeys(postbox);

        for (const key of keys) {
            this.postboxMap.set(key, postbox);
        }

        return this;
    }

    /**
     * @public
     * @param {IPostBox} postbox
     * @returns {this}
     */
    removePostBox(postbox) {
        if (!postbox) {
            return;
        }

        this.validateDisposal();

        const keys = this.generateMapKeys(postbox);

        for (const key of keys) {
            if (postbox === this.postboxMap.get(key)) {
                this.postboxMap.delete(key);
            }
        }

        return this;
    }

    /**
     * @public
     * @returns {Iterable<PostCarrier>}
     */
    carriers() {
        return this.carrierMap.values();
    }

    /**
     * @public
     * @param {PostCarrier} carrier
     * @returns {this}
     */
    addCarrier(carrier) {
        if (!(carrier instanceof PostCarrier)) {
            throw new Error("carrier must be an instance of PostCarrier.");
        }

        this.validateDisposal();

        const keys = this.generateMapKeys(carrier);

        for (const key of keys) {
            this.carrierMap.set(key, carrier);
        }

        return this;
    }


    /**
     * @public
     * @param {PostCarrier} carrier
     * @returns {this}
     */
    removeCarrier(carrier) {
        if (!carrier) {
            return;
        }

        if (!(carrier instanceof PostCarrier)) {
            throw new Error("carrier must be an instance of PostCarrier.");
        }

        this.validateDisposal();

        const keys = this.generateMapKeys(carrier);

        for (const key of keys) {
            if (carrier === this.carrierMap.get(key)) {
                this.carrierMap.delete(key);
            }
        }

        return this;
    }

    /**
     * @public
     * @param {IMail<any>} mail 
     * @returns {Promise<IMail<any>>}
     */
    async deliverMailAsync(mail) {
        this.validateDisposal();

        const incomingMail = await this.PipeToIncomingPipeAsync(null, mail);
        const postbox = this.getMatchedPostBox(incomingMail.to);

        if (postbox) {
            return await postbox.deliverMailAsync(mail);
        }

        return await this.emitMailAsync(incomingMail);
    }

    /**
     * @protected
     * @param {URL} url
     * @returns {IPostBox}
     */
    getMatchedPostBox(url) {
        const incomingMailUrl = `${url.protocol}://${url.host}${url.pathname}`;

        let postbox = this.postboxMap.get(incomingMailUrl);

        if (!postbox) {
            for (const postboxPattern of this.postboxMap.keys()) {
                if (postboxPattern instanceof RegExp && postboxPattern.test(incomingMailUrl)) {
                    postbox = this.postboxMap.get(postboxPattern);
                    break;
                }
            }
        }

        return postbox;
    }

    /**
     * @protected
     * @abstract
     * @param {IMail<any>} outgoingMail
     * @returns {Promise<IMail<any>>}
     */
    async doSendMailAsync(outgoingMail) {
        throw new Error("Not implemented!");
    }

    /**
     * @protected
     * @abstract
     * @param {IMail<any>} outgoingMail
     * @returns {void}
     */
    doDropMail(outgoingMail) {
        throw new Error("Not implemented!");
    }

    /**
     * @protected
     * @param {IPostBox} postal
     * @returns {Array<string | RegExp>}
     */
    generateMapKeys(postal) {
        if (!postal.location) {
            return [/.*/ig];
        }

        
    }
}
exports.PostOffice = PostOffice;
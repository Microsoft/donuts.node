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
const { PostBox } = require("./post-box");
const { Router } = require("./router");

/**
 * @class
 * @extends {Postal}
 */
class PostOffice extends Postal {
    /**
     * @public
     * @param {URL} [url]
     */
    constructor(url) {
        super(url);

        /** @type {import("./router").Router<IPostBox>} */
        const postboxRouter = new Router();

        /** @type {import("./router").Router<PostCarrier>} */
        const carrierRouter = new Router();

        /**
         * @public
         * @param {string} url
         * @returns {IPostBox}
         */
        this.createPostBox = (url) => {
            this.validateDisposal();

            const postbox = new PostBox(this, new URL(url, this.url || undefined));

            postboxRouter.push(postbox.url, postbox);

            return postbox;
        };

        /**
         * @public
         * @param {IPostBox} postbox
         * @returns {this}
         */
        this.attachPostBox = (postbox) => {
            if (!postbox) {
                return;
            }

            this.validateDisposal();

            postboxRouter.push(postbox.url, postbox);

            return this;
        };

        /**
         * @public
         * @param {IPostBox} postbox
         * @returns {this}
         */
        this.deletePostBox = (postbox) => {
            if (!postbox) {
                return;
            }

            this.validateDisposal();

            postboxRouter.delete(postbox.url);

            return this;
        };

        /**
         * @protected
         * @param {URL} url
         * @returns {IPostBox}
         */
        this.getMatchedPostBox = (url) => {
            if (!(url instanceof URL)) {
                throw new Error("A valid URL must be provided.");
            }

            this.validateDisposal();

            return postboxRouter.get(url);
        };

        /**
         * @public
         * @param {PostCarrier} carrier
         * @returns {this}
         */
        this.addCarrier = (carrier) => {
            if (!(carrier instanceof PostCarrier)) {
                throw new Error("carrier must be an instance of PostCarrier.");
            }

            this.validateDisposal();

            carrierRouter.push(carrier.url, carrier);

            return this;
        };

        /**
         * @public
         * @param {PostCarrier} carrier
         * @returns {this}
         */
        this.removeCarrier = (carrier) => {
            if (!(carrier instanceof PostCarrier)) {
                throw new Error("carrier must be an instance of PostCarrier.");
            }

            this.validateDisposal();

            carrierRouter.delete(carrier.url);

            return this;
        };

        /**
         * @protected
         * @param {URL} url
         * @returns {PostCarrier}
         */
        this.getMatchedCarrier = (url) => {
            if (!(url instanceof URL)) {
                throw new Error("A valid URL must be provided.");
            }

            this.validateDisposal();

            return carrierRouter.get(url);
        };
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
     * @abstract
     * @param {IMail<any>} outgoingMail
     * @returns {Promise<IMail<any>>}
     */
    doSendMailAsync(outgoingMail) {
        /** @type {PostCarrier} */
        const carrier = this.getMatchedCarrier(outgoingMail.to);

        if (!carrier) {
            throw new Error(`Unable to find the correct carrier to send mail: ${outgoingMail.id} => ${outgoingMail.to.href}`);
        }

        return carrier.sendMailAsync(outgoingMail);
    }

    /**
     * @protected
     * @abstract
     * @param {IMail<any>} outgoingMail
     * @returns {void}
     */
    doDropMail(outgoingMail) {
        /** @type {PostCarrier} */
        const carrier = this.getMatchedCarrier(outgoingMail.to);

        if (!carrier) {
            throw new Error(`Unable to find the correct carrier to drop mail: ${outgoingMail.id} => ${outgoingMail.to.href}`);
        }

        carrier.dropMail(outgoingMail);
    }
}
exports.PostOffice = PostOffice;
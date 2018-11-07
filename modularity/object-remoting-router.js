//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { ObjectRemotingProxy } = require("donuts.node-remote/object-remoting-proxy");

/**
 * @class
 * @implements {Donuts.Modularity.IObjectRemotingRouter}
 */
class ObjectRemotingRouter {
    /**
     * 
     * @param {Donuts.Remote.ICommunicator} remote
     * @param {Donuts.Modularity.IObjectRemotingRouter} localRouter 
     */
    constructor(remote, localRouter) {
        /**
         * @private
         * @type {Donuts.Remote.IObjectRemotingProxy}
         */
        this.remote = new ObjectRemotingProxy(remote, null, true);

        /**
         * @private
         * @type {Donuts.Modularity.IObjectRemotingRouter}
         */
        this.local = localRouter;

        /**
         * @param {Donuts.Remote.IObjectRemotingProxy} requestor
         * @param {string} name
         * @param {...*} extraArgs
         * @returns {Promise<*>}
         */
        this.onResolve = (requestor, name, ...extraArgs) => this.local.requestAsync(name, ...extraArgs);

        this.remote.resolver = this.onResolve;
    }

    /**
     * @public
     * @template T
     * @param {string} identifier 
     * @param  {...any} extraArgs 
     * @returns {Promise<T>}
     */
    async requestAsync(identifier, ...extraArgs) {
        if (!this.remote) {
            throw new Error("ObjectRemotingRouter already disposed.");
        }

        return this.remote.requestAsync(identifier, ...extraArgs);
    }

    /**
     * @returns {Promise<void>}
     */
    async disposeAsync() {
        if (this.remote) {
            await this.remote.disposeAsync();

            this.local = undefined;
            this.remote = undefined;
        }
    }
}
exports.ObjectRemotingRouter = ObjectRemotingRouter;
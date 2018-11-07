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
class ObjectRemotingHostRouter {
    /**
     * 
     * @param {Donuts.Remote.ICommunicationHost} remote
     * @param {Donuts.Modularity.IObjectRemotingRouter} localRouter 
     */
    constructor(remote, localRouter) {
        /**
         * @private
         * @type {Array.<Donuts.Remote.IObjectRemotingProxy>}
         */
        this.proxies = [];

        /**
         * @private
         * @type {Donuts.Remote.ICommunicationHost}
         */
        this.remote = remote;

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
        this.onResolve = async (requestor, name, ...extraArgs) => {
            /** @type {*} */
            let resolvedResult = await this.local.requestAsync(name, ...extraArgs);

            if (resolvedResult !== undefined) {
                return resolvedResult;
            }

            for (const proxy of this.proxies) {
                if (proxy === requestor) {
                    continue;
                }

                resolvedResult = await proxy.requestAsync(name, ...extraArgs);

                if (resolvedResult !== undefined) {
                    return resolvedResult;
                }
            }

            return undefined;
        };

        /**
         * @private
         * @param {Donuts.Remote.ICommunicationHost} host
         * @param {Donuts.Remote.ICommunicator} communicator
         * @returns {void}
         */
        this.onProxyConnection = (host, communicator) => {
            const proxy = new ObjectRemotingProxy(communicator);

            communicator.on("close", () => {
                if (!Array.isArray(this.proxies)) {
                    return;
                }

                const proxyIndex = this.proxies.findIndex((itemProxy) => itemProxy === proxy);

                if (proxyIndex < 0) {
                    return;
                }

                this.proxies.splice(proxyIndex, 1);
            });

            proxy.resolver = this.onResolve;
            this.proxies.push(proxy);
        };
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

        /** @type {*} */
        let resolvedResult;

        for (const proxy of this.proxies) {
            resolvedResult = await proxy.requestAsync(name, ...extraArgs);

            if (resolvedResult !== undefined) {
                return resolvedResult;
            }
        }

        return undefined;
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    async disposeAsync() {
        if (this.remote) {
            await this.remote.disposeAsync();

            this.remote = undefined;
            this.proxies = undefined;
            this.local = undefined;
        }
    }
}
exports.ObjectRemotingHostRouter = ObjectRemotingHostRouter;
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

/** @typedef {import("../postal").Postal} Postal */
/** @typedef {import("../post-carrier").PostCarrier} PostCarrier */

/**
 * @typedef IMailPromiseRecord
 * @property {(value?: any) => void} resolve 
 * @property {(reason?: any) => void} reject 
 */

const SocketServer = require("net").Server;
const { PostCarrier } = require("../post-carrier");

/**
 * @class
 * @extends {PostCarrier}
 */
class SocketCarrier extends PostCarrier {
    /**
     * @public
     * @param {URL} url 
     * @returns {SocketCarrier}
     */
    static createByUrl(url) {
        /** @type {SocketServer} */
        let server;

        const ipc = require("donuts.node-ipc");

        switch (url.protocol) {
            case "ipc:":
                if (url.search || url.hash) {
                    throw new Error("search and hash in the url is not supported by ipc protocol.")
                }

                /** @type {Array<string>} */
                const pathSegements = [];

                pathSegements.push(url.hostname, url.port);

                if (url.username) {
                    pathSegements.push(url.username);
                    pathSegements.push(url.password);
                }

                if (url.pathname && url.pathname !== "/") {
                    pathSegements.push(...url.pathname.split("/"));
                }

                server = ipc.host(...pathSegements);
                break;

            case "tcp:":
                break;

            default:
                throw new Error(`Not supported protocol: ${url.protocol}`);
        }

        return new SocketCarrier(server);
    }

    /**
     * @public
     * @param {SocketServer} server
     */
    constructor(server) {
        if (!(server instanceof SocketServer)) {
            throw new Error("server must be an instance of net.Server");
        }

        super();

        /**
         * @private
         * @readonly
         * @type {Donuts.Logging.ILog}
         */
        this.log = log;

        /**
         * @private 
         * @readonly
         * @type {SocketServer}
         */
        this.server = server;

        /**
         * @private
         * @readonly
         * @type {number}
         */
        this.timeout = timeout;

        /**
         * @private
         * @readonly
         * @type {Donuts.IStringKeyDictionary<IMailPromiseRecord>}
         */
        this.mailDictionary = Object.create(null);

        this.server.on("connection",
            /**
             * @param {import("net").Socket} socket
             */
            (socket) => {
                const postbox = new SimplePostBox(
                    /**
                     * @param {IPostBox<TOutgoingData, TIncomingData>} postbox
                     * @param {IMail<TOutgoingData>} outgoingMail
                     * @returns {Promise<IMail<TIncomingData>>}
                     */
                    (postbox, outgoingMail) => new Promise((resolve, reject) => {
                        /** @type {string} */
                        const mailId = outgoingMail.id;

                        /** @type {Donuts.IStringKeyDictionary<IMailPromiseRecord>} */
                        const mailDictionary = this.mailDictionary;

                        /** @type {IMailPromiseRecord} */
                        const mailRecord = mailDictionary[mailId] = Object.create(null);

                        mailRecord.reject = (reason) => {
                            delete mailDictionary[mailId];

                            reject(reason);
                        };

                        mailRecord.resolve = (value) => {
                            delete mailDictionary[mailId];

                            resolve(value);
                        };

                        if (typeof this.timeout === "number") {
                            setTimeout(() => mailRecord.reject(new Error(`Timed out (${this.timeout}ms).`)), this.timeout);
                        }

                        socket.write(Buffer.from(JSON.stringify(outgoingMail)).toString("base64") + ";");
                    }),

                    /**
                     * @returns {Promise<void>}
                     */
                    async () => {
                        socket.destroy();
                    });

                /** @type {string} */
                let incomingBuffer = "";

                socket.on("data",
                    /**
                     * @param {Buffer | string} data
                     */
                    (data) => {
                        try {
                            if (Buffer.isBuffer(data)) {
                                data = data.toString("utf8");
                            }

                            incomingBuffer = incomingBuffer + data;

                            const segmentEnd = incomingBuffer.indexOf(";");

                            if (segmentEnd < 0) {
                                return;
                            }

                            const segments = incomingBuffer.split(";");

                            for (let dataEntryIndex = 0; dataEntryIndex < segments.length - 1; dataEntryIndex++) {
                                const dataEntry = segments[dataEntryIndex];

                                if (!dataEntry) {
                                    continue;
                                }

                                /** @type {IMail<any>} */
                                const incomingMail = JSON.parse(Buffer.from(dataEntry, "base64").toString("utf8"));

                                /** @type {IMailPromiseRecord} */
                                const mailPromiseRecord = this.mailDictionary[incomingMail.id];

                                if (!mailPromiseRecord) {
                                    this.emit("", this, incomingMail);

                                } else {
                                    mailPromiseRecord.resolve(incomingMail);
                                }
                            }

                            incomingBuffer = segments.pop() || "";

                        } catch (error) {
                            if (this.log) {
                                this.log.writeExceptionAsync(error);
                            }

                            throw error;
                        }
                    });

                this.emit("postbox-acquired", this, postbox);
            });

        this.server.on("close",
            () => {

            });
    }
}
exports.SocketCarrier = SocketCarrier;
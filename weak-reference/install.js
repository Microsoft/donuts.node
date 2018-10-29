//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const fs = require("fs");
const https = require("https");

/**
 * @param {string} url
 * @returns {Promise<import("http").IncomingMessage>}
 */
function httpsGetAsync(url) {
    return new Promise((resolve, reject) => {
        try {
            https.get(url, (response) => resolve(response));
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 
 * @param {string} url
 * @param {string} filename
 * @returns {Promise<void>} 
 */
function downloadAsync(url, filename) {
    return httpsGetAsync(url).then((response) => {
        switch (response.statusCode) {
            case 302:
            case 301:
                return downloadAsync(response.headers.location, filename);

            case 200:
                return new Promise((resolve, reject) =>
                    response
                        .pipe(fs.createWriteStream(filename))
                        .on("end", () => resolve())
                        .on("error", (err) => reject(err)));

            default:
                return Promise.reject(new Error(`Failed to download: HTTP ${response.statusCode} ${response.statusMessage}`));
        }
    });


}

(() => {
    /** @enum {string} */
    const NodeEnv = {
        prod: "production",
        dev: "development"
    };

    /** @type {NodeEnv} */
    const node_env = process.env["NODE_ENV"];

    if (node_env !== NodeEnv.prod) {
        require("./build");
        return;
    }

    const archs = ["ia32", "x64"];

    /** @type {PackageJson} */
    const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

    for (const arch of archs) {
        const url = `${packageJson.homepage}/releases/download/weak-reference.node-${packageJson["weak-reference.node"].version}/weak-reference.${process.platform}.${arch}.node`;

        console.log("Downloading", url);
        downloadAsync(url, `./weak-reference.${process.platform}.${arch}.node`);
    }
})();

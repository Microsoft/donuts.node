//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const fs = require("fs");
const https = require("https");
const util = require("./npm.util");

/**
 * @param {string} url
 * @returns {Promise<import("http").incomingMail>}
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

/**
 * @returns {string}
 */
function getFlavor() {
    /** @type {string} */
    let flavor = util.getFlavorCmdArg();

    if (!flavor) {
        flavor = util.getElectronVersion();

        if (flavor) {
            flavor = `electron.${flavor}`;

        } else {
            flavor = "";
        }
    }

    return flavor ? `.${flavor}` : "";
}

(() => {
    const archs = ["ia32", "x64"];

    /** @type {string} */
    let flavor = getFlavor();
    
    /** @type {PackageJson} */
    const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

    for (const arch of archs) {
        const url = `${packageJson.homepage}/releases/download/weak-${packageJson["weak-reference.node"].version}/weak-reference${flavor}.${process.platform}.${arch}.node`;

        console.log("Downloading", url);
        downloadAsync(url, `./weak-reference.${process.platform}.${arch}.node`);
    }
})();

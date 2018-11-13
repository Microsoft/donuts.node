//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const fs = require("fs");
const path = require("path");

/**
 * @return {Object.<string, *>}
 */
exports.getHostPackageJson = () => {
    const hostPackageDir = process.env["INIT_CWD"];

    if (!hostPackageDir) {
        return undefined;
    }

    return JSON.parse(fs.readFileSync(path.join(hostPackageDir, "package.json"), { encoding: "utf8" }));
};

/** @type {string} */
let electronVersion = undefined;
exports.getElectronVersion = () => {
    if (electronVersion) {
        return electronVersion;
    }

    /** @type {Object.<string, *>} */
    const hostPackageJson = exports.getHostPackageJson();
    const Regex_Dependencies = /dependencies/i;

    mainLoop:
    for (const propertyName in hostPackageJson) {
        if (!Regex_Dependencies.test(propertyName)) {
            continue;
        }

        /** @type {Object.<string, string>} */
        const dependencies = hostPackageJson[propertyName];

        for (const depName in dependencies) {
            if (depName !== "electron") {
                continue;
            }

            const versionMatch = /(\d+\.\d+\.\d+(?:\-.*)?)/i.exec(dependencies[depName]);

            if (!versionMatch) {
                throw new Error(`electron version cannot be recognized: ${dependencies[depName]}`);
            }

            electronVersion = versionMatch[1];
            break mainLoop;
        }
    }

    return electronVersion;
};

exports.getFlavorCmdArg = () => {
    const shell = require("donuts.node/shell");
    const cmdArgFlavor = shell.getCmdArg("flavor");

    if (cmdArgFlavor) {
        return cmdArgFlavor;
    }

    return undefined;
};
//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { execSync } = require("child_process");
const shell = require("donuts.node/shell");
const util = require("./npm.util");

/**
 * 
 * @param {string} arch 
 * @param {string} buildType 
 * @returns {void}
 */
function nodeGyp(arch, buildType) {
    const nodeGypCmd = `node-gyp rebuild --arch ${arch} --${buildType.toLowerCase()} "./binding.gyp"`;

    console.log("Executing", nodeGypCmd);
    console.log(execSync(nodeGypCmd, { encoding: "utf8" }));
}

/**
 * 
 * @param {string} arch 
 * @param {string} buildType 
 * @returns {void}
 */
function electronRebuild(arch, buildType) {
    const electronVersion = util.getElectronVersion();

    if (!electronVersion) {
        throw new Error("Cannot find electron dependency info.");
    }

    const electronRebuildCmd = `electron-rebuild --version ${electronVersion} --module-dir . --arch ${arch} ${buildType === "Debug" ? "--debug" : ""}`;

    console.log("Executing", electronRebuildCmd);
    console.log(execSync(electronRebuildCmd, { encoding: "utf8" }));
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
            flavor = "electron";

        } else {
            flavor = undefined;
        }
    }

    return flavor;
}

(() => {
    const fs = require("fs");
    const archs = ["ia32", "x64"];
    const buildType = shell.getCmdArg("release") ? "Release" : "Debug";
    const flavor = getFlavor();

    /** @type {BindingGyp} */
    const bindingGyp = {
        targets: [
            {
                target_name: "weak-reference",
                sources: ["./weak-reference.cc"],
                include_dirs: ["<!(node -e \"require('nan')\")"]
            }
        ]
    };

    for (const arch of archs) {
        bindingGyp.targets[0].target_name = `weak-reference.${process.platform}.${arch}`;

        fs.writeFileSync("./binding.gyp", JSON.stringify(bindingGyp, null, 4), { encoding: "utf8" });

        const targetName = bindingGyp.targets[0].target_name;

        switch (flavor) {
            case "electron":
                console.log(`[${buildType}@${arch}]`, "electron-rebuild");
                electronRebuild(arch, buildType);
                break;

            case "node":
            default:
                console.log(`[${buildType}@${arch}]`, "node-gyp");
                nodeGyp(arch, buildType);
                break;
        }

        fs.copyFileSync(`./build/${buildType}/${targetName}.node`, `./weak-reference.${process.platform}.${arch}.node`);

        // Windows only
        const pdbPath = `./build/${buildType}/${targetName}.pdb`;

        if (fs.existsSync(pdbPath)) {
            fs.copyFileSync(pdbPath, `./weak-reference.${process.platform}.${arch}.pdb`);
        }
    }
})();

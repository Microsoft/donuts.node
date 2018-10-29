//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

(() => {
    const { execSync } = require("child_process");
    const fs = require("fs");
    const path = require("path");
    const archs = ["ia32", "x64"];
    const buildType = process.argv.find((arg) => arg === "--release") ? "Release" : "Debug";

    /** @type {BindingGyp} */
    const bindingGyp = {
        targets: [
            {
                target_name: "weak-reference",
                sources: [path.resolve("./weak-reference.cc")],
                include_dirs: ["<!(node -e \"require('nan')\")"]
            }
        ]
    };

    for (const arch of archs) {
        const nodeGypCmd = `node-gyp rebuild --arch ${arch} --${buildType.toLowerCase()} "./binding.gyp"`;

        bindingGyp.targets[0].target_name = `weak-reference.${process.platform}.${arch}`;

        fs.writeFileSync("./binding.gyp", JSON.stringify(bindingGyp), { encoding: "utf8" });

        const targetName = bindingGyp.targets[0].target_name;

        console.log("Executing", nodeGypCmd);
        console.log(execSync(nodeGypCmd, { encoding: "utf8" }));

        fs.copyFileSync(`./build/${buildType}/${targetName}.node`, `./weak-reference.${process.platform}.${arch}.node`);
        fs.copyFileSync(`./build/${buildType}/${targetName}.pdb`, `./weak-reference.${process.platform}.${arch}.pdb`);
    }
})();

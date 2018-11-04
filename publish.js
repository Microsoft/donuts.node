//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const fileSytem = require("./core/fileSystem");
const shell = require("./core/shell");
const donuts = require("./core");

/** @type {RegExp} */
const tgzFileRegex = /^.*\.tgz$/i;

/** @type {string} */
const buildNumber = shell.getCmdArg("build-number") || "1.0.0-private";

/** @type {string} */
const currentDir = path.resolve(".");

/** @type {string} */
const publishDir = path.resolve("./publish");

/**
 * 
 * @param {()=>string|void} func
 * @param {...*} logs
 */
function logStep(func, ...logs) {
    console.log("*", ...logs);
    console.log("------------------------------------");
    console.group()

    const result = func();

    if (result) {
        console.log(result);
    }

    console.groupEnd();
    console.log();
}

/**
 * 
 * @param {string} projectDir 
 * @return {void}
 */
function copyTgzFiles(projectDir) {
    /** @type {string} */
    const projectPublishDir = path.join(projectDir, "publish");

    for (const tgzFileName of fs.readdirSync(projectPublishDir)) {
        if (!tgzFileRegex.test(tgzFileName)) {
            continue;
        }

        console.log("Copying: ", path.join(projectPublishDir, tgzFileName), " => ", path.join(publishDir, tgzFileName));
        fs.copyFileSync(path.join(projectPublishDir, tgzFileName), path.join(publishDir, tgzFileName));
    }
}

/**
 * 
 * @param {string} projectDir 
 */
function updateDependenciesVersion(projectDir) {
    /** @type {string} */
    const prefix = "donuts.node";

    /** @type {string} */
    const buildDir = path.join(projectDir, "build");

    /** @type {Object.<string, *>} */
    const packageJson = JSON.parse(fs.readFileSync(path.join(buildDir, "package.json"), { encoding: "utf8" }));

    /** @type {Object.<string, *>} */
    const dependencies = packageJson["dependencies"];

    if (!dependencies) {
        console.log("There is no dependency.");
        return;
    }

    for (const depName of Object.getOwnPropertyNames(dependencies)) {
        if (!depName.startsWith(prefix)) {
            continue;
        }

        const depVersion = `https://github.com/Microsoft/donuts.node/releases/download/${prefix}-${buildNumber}/${depName}-${buildNumber}.tgz`

        console.log(`Updating dependency "depName" version: ${dependencies[depName]} => ${depVersion}`);
        dependencies[depName] = depVersion;
    }

    fs.writeFileSync(path.join(buildDir, "package.json"), JSON.stringify(packageJson, null, 4));
    console.log("Done.");
}

/**
 * 
 * @param {string} projectDir 
 */
function cleanProjectDir(projectDir) {
    if (fs.existsSync(path.join(projectDir, "package-lock.json"))) {
        console.log("Deleting: ", path.join(projectDir, "package-lock.json"));
        fs.unlinkSync(path.join(projectDir, "package-lock.json"));
    }

    console.log("Done.");
}

(async () => {
    process.env["BUILD_BUILDNUMBER"] = buildNumber;

    // Recreate publish directory.
    fileSytem.removeDirectorySync(publishDir);
    await donuts.sleepAsync(1000);
    fs.mkdirSync(publishDir);

    for (const dirName of fs.readdirSync(currentDir)) {
        const projectDir = path.join(currentDir, dirName);

        if (dirName.startsWith(".") || dirName === "publish" || !fs.statSync(projectDir).isDirectory()) {
            continue;
        }

        console.log("Publishing project: ", dirName);
        console.log("======================================");
        console.group();

        logStep(() => cleanProjectDir(projectDir), "Clean up project");
        logStep(() => execSync("npm install", { cwd: projectDir, encoding: "utf8" }), "npm install");
        logStep(() => execSync("gulp clean-build", { cwd: projectDir, encoding: "utf8" }), "gulp clean-build");
        logStep(() => execSync("gulp npm-pack", { cwd: projectDir, encoding: "utf8" }), "gulp npm-pack");

        logStep(() => copyTgzFiles(projectDir), "Copy tgz files");

        logStep(() => updateDependenciesVersion(projectDir),  "Update the versions of internal dependencies");

        console.groupEnd();
    }
})();
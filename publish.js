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
 * @param {string} category 
 * @param {string} msg 
 * @param {()=>string|void} func
 * @param {boolean} [hasLogs]
 */
function logStep(category, msg, func, hasLogs) {
    console.log("--------------------------------------");
    console.log("- ", category, msg);

    if (hasLogs) {
        console.log("--------------------------------------");
    }

    const result = func();

    if (hasLogs) {
        console.log("--------------------------------------");
        console.log("");
    }

    if (result) {
        if (!hasLogs) {
            console.log("--------------------------------------");
        }

        console.log(result);
        console.log("");
    }
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

        console.log(`Updating dependency "depName" version: ${dependencies[depName]} => ${buildNumber}`);
        dependencies[depName] = buildNumber;
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

        logStep("DEL", "Clean up project", () => cleanProjectDir(projectDir), true);
        logStep("NPM", "Install", () => execSync("npm install", { cwd: projectDir, encoding: "utf8" }), true);
        logStep("GULP", "clean-build", () => execSync("gulp clean-build", { cwd: projectDir, encoding: "utf8" }), false);
        logStep("GULP", "npm-pack", () => execSync("gulp npm-pack", { cwd: projectDir, encoding: "utf8" }), false);

        logStep("COPY", "Copy tgz files", () => copyTgzFiles(projectDir), true);

        logStep("PACKAGE.JSON", "Update the versions of internal dependencies", () => updateDependenciesVersion(projectDir), true);
    }
})();
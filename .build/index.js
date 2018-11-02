//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const delAsync = require("del");
const util = require("util");
const makedirAsync = util.promisify(fs.mkdir);

async function pack() {
    const buildDir = path.resolve("./build");
    const publishDir = path.resolve("./publish");

    if (process.env["BUILD_BUILDNUMBER"]) {
        console.log("NPM", "Versioning");
        console.log(
            execSync(
                `npm version --allow-same-version ${process.env["BUILD_BUILDNUMBER"]}`,
                { cwd: buildDir }));
    }

    /** @type {Object.<string, string>} */
    const packageJson = JSON.parse(fs.readFileSync(path.join(buildDir, "package.json"), { encoding: "utf8" }));
    const packageVersion = packageJson["version"];
    const packageName = packageJson["name"];
    const tgzName = `${packageName}-${packageVersion}.tgz`;

    console.log("NPM", "Packing");
    console.log(execSync("npm pack", { cwd: buildDir }));

    fs.copyFileSync(
        path.join(buildDir, tgzName),
        path.join(publishDir, tgzName));
    fs.unlinkSync(path.join(buildDir, tgzName));
}

/** 
 * @param {typeof import("gulp")} gulp
 * @return {void}
 */
module.exports = (gulp) => {

    gulp.task("clean", () => delAsync(["./build", "./publish"]));

    gulp.task("init", async () => {
        /** @type {Array.<string>} */
        const dirs = [
            "./build",
            "./publish"
        ];

        await new Promise((resolve) => setTimeout(resolve, 1000));

        for (let dir of dirs) {
            dir = path.resolve(dir);

            if (!fs.existsSync(dir)) {
                console.log("Creating directory: ", dir);
                await makedirAsync(dir);
            }
        }
    });

    gulp.task("build", () =>
        gulp.src(
            [
                "./**/*",
                "!binding.gyp",
                "!*.pdb",
                "!*.node",
                "!gulpfile.js",
                "!build",
                "!publish",
                "!node_modules",
                "!node_modules/**/*",
                "!test",
                "!test/**/*",
                "!.vscode",
                "!jsconfig.json",
                "!package-lock.json"
            ])
            .pipe(gulp.dest("./build")));

    gulp.task("clean-build", gulp.series("clean", "init", "build"));

    gulp.task("publish", gulp.series(
        "clean-build",
        pack
    ));
};
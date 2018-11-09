//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const { app, BrowserWindow } = require("electron");
const fs = require("fs");

/** @type {import("electron").BrowserWindow} */
let mainWnd;

app.commandLine.appendSwitch("js-flags", "--expose_gc");

app.on("ready", () => {
    mainWnd = new BrowserWindow();

    mainWnd.loadURL(JSON.parse(fs.readFileSync("./package.json", { encoding: "utf8" })).homepage);
    mainWnd.show();
});

app.on("window-all-closed", () => app.quit());
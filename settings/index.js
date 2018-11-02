//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const path = require("path");
const shell = require("donuts.node/shell");
const fileSystem = require("donuts.node/fileSystem");
const { FileSettings } = require("./file-settings");

fileSystem.createDirectorySync(shell.getDir("UserData"));

/** @type {Donuts.Settings.ISettings} */
exports.defaultSettings = exports.openSettings("settings");

/**
 * Open a set of settings as a settings chain. If the last settings doesn't support writing,
 * a new writable settings will be created and placed under userData to wrap the settings chain
 * as the last settings object, which provides a writing capability.
 * @param {...string} names the names of settings to be open as a settings chain.
 * @returns {Donuts.Settings.ISettings}
 */
exports.openSettingsAsChain = (...names) => {
    if (!Array.isArray(names)) {
        throw new Error("names must be an array of string.");
    }

    /** @type {Donuts.Settings.ISettings} */
    let settings = null;

    names.forEach(name => settings = this.openSettings(settings, name));

    if (settings.readonly) {
        // if the last settings doesn't allow writing,
        // create a writable settings file in appData folder to wrap the readonly settings.
        settings = new FileSettings(path.join(shell.getDir("UserData"), names[names.length - 1] + ".json"), false, settings);
    }

    return settings;
}

/**
 * @param {string} name
 * @param {Donuts.Settings.ISettings} [parentSettings]
 * @returns {Donuts.Settings.ISettings}
 */
exports.openSettings = (name, parentSettings) => {
    const { isString } = require("donuts.node/utils");

    if (!isString(name)) {
        throw new Error("Invalid settings name!");
    }

    const { local } = require("donuts.node/path");
    const { existsSync } = require("fs");

    /** @type {string} */
    let settingsPath = local(name + ".json", true);

    if (!existsSync(settingsPath)) {
        settingsPath = path.join(shell.getDir("UserData"), name + ".json");
    }

    return new FileSettings(settingsPath, null, parentSettings);
}

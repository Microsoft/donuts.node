//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const fs = require("fs");
const utils = require("donuts.node/utils");
const { Settings } = require("./settings");

/**
 * @class
 */
class FileSettings extends Settings {
    /**
     * @public
     * @param {string} settingsPath 
     * @param {boolean} [readOnly] 
     * @param {Donuts.Settings.ISettings} [parentSettings]
     */
    constructor(settingsPath, readOnly, parentSettings) {
        if (utils.isNullOrUndefined(settingsPath)) {
            throw new Error("settingsPath must be supplied.");
        }

        /** @type {*} */
        let initialSettings;

        if (!fs.existsSync(settingsPath)) {
            if (readOnly === true) {
                throw new Error(`Settings file, ${settingsPath}, doesn't exist.`);
            }

            initialSettings = Object.create(null);
            fs.writeFileSync(settingsPath, JSON.stringify(initialSettings), { encoding: "utf8" });

        } else {
            initialSettings = JSON.parse(fs.readFileSync(settingsPath, { encoding: "utf8" }));

            if (utils.isNullOrUndefined(readOnly) || readOnly === false) {
                try {
                    fs.appendFileSync(settingsPath, "", { encoding: "utf8" });
                    readOnly = false;
                } catch (err) {
                    if (readOnly === false) {
                        throw new Error(`No permission to write settings file, {settingsPath}. error: {err}`);
                    } else {
                        readOnly = true;
                    }
                }
            }
        }

        super(initialSettings, readOnly, parentSettings);

        /**
         * @private
         * @readonly
         * @type {string}
         */
        this.settingsPath = settingsPath;
    }

    /**
     * @public
     * @template T
     * @param {string} settingPath 
     * @returns {Promise<T>}
     */
    getAsync(settingPath) {
        return super.getAsync(settingPath);
    }

    /**
     * @public
     * @template T
     * @param {string} settingPath 
     * @param {T} value 
     * @returns {Promise<void>}
     */
    async setAsync(settingPath, value) {
        await super.setAsync(settingPath, value);

        fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 4), { encoding: "utf8" });
    }
}
exports.FileSettings = FileSettings;

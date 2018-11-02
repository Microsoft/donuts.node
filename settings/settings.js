//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const utils = require("donuts.node/utils");

/**
 * @class
 * @implements {Donuts.Settings.ISettings}
 */
class Settings {
    /**
     * 
     * @param {Object.<string, *>} [initialSettings]
     * @param {boolean} [readonly]
     * @param {Donuts.Settings.ISettings} [parentSettings]
     */
    constructor(initialSettings, readonly, parentSettings) {

        /**
         * @protected
         * @readonly
         * @type {Object.<string, *>}
         */
        this.settings = undefined;

        /**
         * @private
         * @readonly
         * @type {Donuts.Settings.ISettings}
         */
        this.parentSettings = utils.isNullOrUndefined(parentSettings) ? undefined : parentSettings;

        /**
         * @public
         * @readonly
         * @type {boolean}
         */
        this.readonly = utils.isNullOrUndefined(readonly) ? false : readonly;

        if (utils.isNullOrUndefined(initialSettings)) {
            this.settings = Object.create(null);

        } else {
            this.settings = initialSettings;
        }
    }

    /**
     * @public
     * @template T
     * @param {string} settingPath 
     * @returns {Promise<T>}
     */
    getAsync(settingPath) {
        if (!settingPath || !utils.isString(settingPath)) {
            throw new Error(`Invalid setting path: ${settingPath}`);
        }

        /** @type {Array.<string>} */
        const pathParts = settingPath.split("/");

        /** @type {*} */
        let settingValue = this.settings;

        for (const part of pathParts) {
            if (!utils.isObject(settingValue)) {
                settingValue = undefined;
                break;
            }

            settingValue = settingValue[part];
        }

        if (settingValue === undefined && this.parentSettings !== undefined) {
            return this.parentSettings.getAsync(settingPath);
        }

        return Promise.resolve(settingValue);
    }

    /**
     * @public
     * @template T
     * @param {string} settingPath 
     * @param {T} value 
     * @returns {Promise<void>}
     */
    async setAsync(settingPath, value) {
        if (this.readonly) {
            throw new Error("Readonly settings cannot be modified.");
        }

        if (!settingPath || !utils.isString(settingPath)) {
            throw new Error(`Invalid setting path: ${settingPath}`);
        }

        /** @type {Array.<string>} */
        const pathParts = settingPath.split("/");

        /** @type {*} */
        let settingValue = this.settings;

        for (let pathPartIndex = 0; pathPartIndex < pathParts.length; pathPartIndex++) {
            if (settingValue === null || (!Array.isArray(settingValue) && !utils.isObject(settingValue))) {
                throw new Error("Unable to travel the settings path because the settings type is not array or object or it is null.");
            }

            const pathPart = pathParts[pathPartIndex];

            if (pathPartIndex === pathParts.length - 1) {
                if (value === undefined) {
                    delete settingValue[pathPart];
                } else {
                    settingValue[pathPart] = value;
                }
            } else if (settingValue[pathPart] === undefined) {
                settingValue[pathPart] = Object.create(null);
            }

            settingValue = settingValue[pathPart];
        }
    }
}
exports.Settings = Settings;
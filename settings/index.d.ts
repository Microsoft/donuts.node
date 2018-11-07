//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/// <reference path="./types.settings.d.ts" />

/** default settings: settings.json */
declare export let defaultSettings: Donuts.Settings.ISettings;

/**
 * Open a set of settings as a settings chain. If the last settings doesn't support writing,
 * a new writable settings will be created and placed under userData to wrap the settings chain
 * as the last settings object, which provides a writing capability.
 * @param names the names of settings to be open as a settings chain.
 * @returns The settings object following the chain.
 */
declare export function openSettingsAsChain(...names: Array<string>): Donuts.Settings.ISettings;

/**
 * Open a settings.
 * @param name The name of the settings to open.
 * @param parentSettings
 * @returns The corresponding settings object.
 */
declare export function openSettings(name: string, parentSettings?: Donuts.Settings.ISettings): Donuts.Settings.ISettings;

declare module "donuts.node-settings/settings" {
    export class Settings implements Donuts.Settings.ISettings {
        protected readonly settings: Donuts.IDictionary<string, any>;

        constructor(initialSettings?: Donuts.IDictionary<string, any>, readonly?: boolean, parentSettings?: Donuts.Settings.ISettings);
    }
}

declare module "donuts.node-settings/file-settings" {
    import { Settings } from "donuts.node-settings/settings";

    export class FileSettings extends Settings {
        protected readonly settings: Donuts.IDictionary<string, any>;

        constructor(settingsPath: string, readOnly?: boolean, parentSettings?: Donuts.Settings.ISettings);
    }
}

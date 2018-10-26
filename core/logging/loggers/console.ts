//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IDictionary } from "../..";
import { Severity, ILoggerSettings, ILogger } from "..";

import * as path from "path";

import * as utils from "../../utils";

export interface IConsoleLoggerSettings extends ILoggerSettings {
    logAllProperties?: boolean;
    logCallerInfo?: boolean;
}

export class ConsoleLogger implements ILogger {
    public readonly name: string;

    private readonly settings: IConsoleLoggerSettings;

    private console: Console;

    constructor(settings?: IConsoleLoggerSettings, targetConsole?: Console) {
        if (!utils.isObject(settings)) {
            settings = {
                name: "console",
                component: "logging.logger.console"
            };
        }

        this.settings = settings;
        this.settings.logAllProperties = utils.pick(settings.logAllProperties, true);
        this.settings.logCallerInfo = utils.pick(settings.logCallerInfo, true);
        this.name = this.settings.name;

        if (utils.isNullOrUndefined(targetConsole)) {
            this.console = console;
        } else {
            this.console = targetConsole;
        }
    }

    public async writeAsync(properties: IDictionary<string>, severity: Severity, message: string): Promise<void> {
        const consoleMsg: string = this.formatConsoleMsg(properties, message);

        switch (severity) {
            case Severity.Critical:
                this.console.error(consoleMsg);
                this.console.trace();
                break;

            case Severity.Error:
                this.console.error(consoleMsg);
                break;

            case Severity.Warning:
                this.console.warn(consoleMsg);
                break;

            case Severity.Event:
            case Severity.Information:
                this.console.info(consoleMsg);
                break;

            case Severity.Verbose:
            default:
                this.console.log(consoleMsg);
                break;
        }
    }

    public async writeExceptionAsync(properties: IDictionary<string>, error: Error): Promise<void> {
        let exceptionMsg: string = "";

        exceptionMsg += error.name + ": " + error.message;
        exceptionMsg += "\r\n";
        exceptionMsg += error.stack;

        this.console.error(this.formatConsoleMsg(properties, exceptionMsg));
    }

    public async writeMetricAsync(properties: IDictionary<string>, name: string, value: number): Promise<void> {
        this.console.info(this.formatConsoleMsg(properties, name + ": " + value.toString()));
    }

    private formatProperties(properties: IDictionary<string>): string {
        let consoleMsg: string = "";

        if (!utils.isNullOrUndefined(properties)) {

            if (this.settings.logAllProperties) {
                for (const propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName) && !propertyName.startsWith("Caller.")) {
                        consoleMsg += `<${propertyName}:${properties[propertyName]}>`;
                    }
                }
            }

            if (this.settings.logCallerInfo
                && (!utils.string.isEmptyOrWhitespace(properties["Caller.FileName"])
                    || !utils.string.isEmptyOrWhitespace(properties["Caller.Name"]))) {
                consoleMsg += `[${path.basename(properties["Caller.FileName"])}:${properties["Caller.Name"]}]`;
            }
        }

        return consoleMsg;
    }

    private formatConsoleMsg(properties: IDictionary<string>, message: string): string {
        let consoleMsg: string = "[" + new Date().toLocaleTimeString() + "]";

        const formatedProperties = this.formatProperties(properties);

        if (!utils.string.isEmptyOrWhitespace(formatedProperties)) {
            consoleMsg += " ";
            consoleMsg += formatedProperties;
        }

        consoleMsg += " ";
        consoleMsg += message;

        return consoleMsg;
    }
}

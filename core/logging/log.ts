//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IDictionary } from "..";
import {
    ILog,
    ILogger,
    Severity
} from ".";

import * as path from "path";

import * as utils from "../utils";
import { ConsoleLogger } from "./loggers/console";

export class Log implements ILog {
    private static _instance: ILog;

    private loggers: Array<ILogger>;

    private defaultProperties: IDictionary<any>;

    private readonly logCallerInfo: boolean;

    private static prepareStackTraceOverride(error: Error, structuredStackTrace: Array<NodeJS.CallSite>): any {
        return structuredStackTrace;
    }

    private static getCallerModuleInfo(): utils.ICallerInfo {
        const previousPrepareStackTraceFn = Error.prepareStackTrace;

        try {
            Error.prepareStackTrace = Log.prepareStackTraceOverride;

            const callStack: Array<NodeJS.CallSite> = <any>(new Error()).stack;

            for (let callStackIndex = 0; callStackIndex < callStack.length; callStackIndex++) {
                const stack = callStack[callStackIndex];
                const stackFileName = stack.getFileName();

                if (!stackFileName.startsWith(path.dirname(module.filename))) {
                    return {
                        fileName: stackFileName,
                        functionName: stack.getFunctionName(),
                        typeName: stack.getTypeName(),
                        lineNumber: stack.getLineNumber(),
                        columnNumber: stack.getColumnNumber()
                    };
                }
            }

            return undefined;
        } finally {
            Error.prepareStackTrace = previousPrepareStackTraceFn;
        }
    }

    public static get instance(): ILog {
        if (!Log._instance) {
            Log._instance = new Log();
        }

        return Log._instance;
    }

    private static stringifier(obj: any): string {
        if (obj instanceof Error) {
            const errorObj = Object.create(null);

            errorObj.message = obj.message;
            errorObj.name = obj.name;

            if ("stack" in obj) {
                errorObj.stack = obj.stack;
            }

            if ("code" in obj) {
                errorObj.code = obj["code"];
            }

            obj = errorObj;
        }

        return utils.string.stringifier(obj);
    }

    public get disposed(): boolean {
        return this.loggers === undefined;
    }

    constructor(includeCallerInfo?: boolean, defaultProperties?: IDictionary<any>) {
        if (!utils.isNullOrUndefined(defaultProperties)
            && !utils.isObject(defaultProperties)) {
            throw new Error("defaultProperties must be an object.");
        }

        this.loggers = [];
        this.defaultProperties = defaultProperties;
        this.logCallerInfo = includeCallerInfo === true;

        this.addLoggerAsync(new ConsoleLogger());
    }

    public async writeMoreAsync(properties: IDictionary<string>, severity: Severity, messageOrFormat: string, ...params: Array<any>): Promise<void> {
        if (!utils.isString(messageOrFormat)) {
            return;
        }

        if (Array.isArray(params) && params.length > 0) {
            messageOrFormat = utils.string.formatEx(Log.stringifier, messageOrFormat, ...params);
        }

        properties = this.generateProperties(properties);

        await Promise.all(this.loggers.map((logger) => logger.writeAsync(properties, severity, messageOrFormat)));
    }

    public writeAsync(severity: Severity, messageOrFormat: string, ...params: Array<any>): Promise<void> {
        return this.writeMoreAsync(null, severity, messageOrFormat, ...params);
    }

    public writeInfoAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
        return this.writeAsync(Severity.Information, messageOrFormat, ...params);
    }

    public writeVerboseAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
        return this.writeAsync(Severity.Verbose, messageOrFormat, ...params);
    }

    public writeWarningAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
        return this.writeAsync(Severity.Warning, messageOrFormat, ...params);
    }

    public writeErrorAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
        return this.writeAsync(Severity.Error, messageOrFormat, ...params);
    }

    public writeCriticalAsync(messageOrFormat: string, ...params: Array<any>): Promise<void> {
        return this.writeAsync(Severity.Critical, messageOrFormat, ...params);
    }

    public async writeExceptionAsync(exception: Error, properties?: IDictionary<string>): Promise<void> {
        properties = this.generateProperties(properties);

        await Promise.all(this.loggers.map((logger) => logger.writeExceptionAsync(properties, exception)));
    }

    public async writeEventAsync(name: string, properties?: IDictionary<string>): Promise<void> {
        if (!utils.isString(name)) {
            return;
        }

        properties = this.generateProperties(properties);

        await Promise.all(this.loggers.map((logger) => logger.writeAsync(properties, Severity.Event, name)));
    }

    public async writeMetricAsync(name: string, value?: number, properties?: IDictionary<string>): Promise<void> {
        if (!utils.isString(name)) {
            return;
        }

        if (!utils.isNumber(value)) {
            value = 1;
        }

        properties = this.generateProperties(properties);

        await Promise.all(this.loggers.map((logger) => logger.writeMetricAsync(properties, name, value)));
    }

    public async removeLoggerAsync(name: string): Promise<ILogger> {
        if (!utils.isString(name)) {
            throw new Error("name must be supplied.");
        }

        for (let loggerIndex = 0; loggerIndex < this.loggers.length; loggerIndex++) {
            const logger = this.loggers[loggerIndex];

            if (name === logger.name) {
                return this.loggers.splice(loggerIndex, 1)[0];
            }
        }

        return undefined;
    }

    public async addLoggerAsync(logger: ILogger): Promise<void> {
        if (!logger) {
            throw new Error("logger must be provided.");
        }

        if (!utils.isObject(logger)) {
            throw new Error("logger must be an object implementing ILogger.");
        }

        this.loggers.push(logger);
    }

    private generateProperties(properties: IDictionary<string>): IDictionary<string> {
        let finalProperties: IDictionary<string> = null;

        if (this.defaultProperties) {
            finalProperties = Object.create(this.defaultProperties);
        }

        if (utils.isObject(properties)) {
            finalProperties = finalProperties || Object.create(null);
            finalProperties = Object.assign(finalProperties, properties);
        }

        if (this.logCallerInfo) {
            const callerInfo = Log.getCallerModuleInfo();

            if (callerInfo) {
                const typeName = callerInfo.typeName || "";
                let functionName = callerInfo.functionName;

                if (!functionName) {
                    functionName = `<Anonymous>@{${callerInfo.lineNumber},${callerInfo.columnNumber}}`;
                }

                finalProperties = finalProperties || Object.create(null);
                finalProperties["Caller.FileName"] = callerInfo.fileName;

                if (!utils.string.isEmptyOrWhitespace(typeName)) {
                    finalProperties["Caller.Name"] = `${typeName}.`;
                } else {
                    finalProperties["Caller.Name"] = "";
                }

                finalProperties["Caller.Name"] += `${functionName}()`;
            }
        }

        return finalProperties;
    }
}

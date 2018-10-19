//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as url from "url";
import * as path from "path";

import * as utils from "./utils";
import * as shell from "./shell";

export interface IPathObject {
    path: string;
    hash?: string;
    query?: string | any;
    search?: string;
}

const appDir: string = shell.getAppDir();

export function resolve(
    pathObject: string | IPathObject,
    fromAppDir: boolean = false): string {

    const urlObject: url.UrlObject = {
        protocol: "file:",
        slashes: true
    };

    if (utils.isString(pathObject)) {
        urlObject.pathname = local(pathObject, fromAppDir);
    } else {
        urlObject.pathname = local(pathObject.path, fromAppDir);

        if (pathObject.hash) {
            urlObject.hash = pathObject.hash;
        }

        if (pathObject.query) {
            urlObject.query = pathObject.query;
        }

        if (pathObject.search) {
            urlObject.search = pathObject.search;
        }
    }

    return url.format(urlObject);
}

export function local(target: string, fromAppDir: boolean = false): string {
    return path.join(fromAppDir ? appDir : path.dirname(utils.getCallerModuleInfo().fileName), target);
}

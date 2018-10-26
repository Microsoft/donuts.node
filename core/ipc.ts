//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as net from "net";
import * as path from "path";
import * as uuidv4 from "uuid/v4";
import * as tmp from "tmp";
import * as utils from "./utils";
import * as fileSytem from "./fileSystem";

function generateWin32IpcPath(...segements: Array<string>): string {
    if (segements.length > 0) {
        return path.join("\\\\?\\pipe", ...segements);
    }

    return path.join("\\\\?\\pipe", process.mainModule.filename, uuidv4());
}

function generateUnixIpcPath(...segements: Array<string>): string {
    let filePath: string;

    if (segements.length > 0) {
        filePath = path.join(...segements);

    } else {
        filePath = tmp.fileSync().name;
    }

    fileSytem.createDirectorySync(path.dirname(filePath));

    return filePath;
}

export function generateIpcPath(...segements: Array<string>): string {
    switch (process.platform) {
        case "win32":
            return generateWin32IpcPath(...segements);

        case "linux":
        case "darwin":
            return generateUnixIpcPath(...segements);

        default:
            throw new Error(`Unsupported platform: ${process.platform}`);
    }
}

export function connect(ipcPath: string): net.Socket {
    if (!utils.isString(ipcPath)) {
        throw new Error("ipcPath must be a string.");
    }

    return net.connect({ path: ipcPath });
}

export function host(ipcPath: string): net.Server {
    if (!utils.isString(ipcPath)) {
        throw new Error("ipcPath must be a string.");
    }

    return net.createServer().listen(ipcPath);
}

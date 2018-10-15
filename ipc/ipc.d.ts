//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
declare module "donut.node/ipc" {
    import { ChildProcess } from "child_process";
    import { Socket } from "net";

    export type ChannelType = NodeJS.Process | ChildProcess | Socket | Electron.IpcRenderer | Electron.WebContents;

    export interface ICommunicatorConstructorOptions {
        id?: string;

        /**
         * Timeout if the remoting operation takes too long. Default: 5 min.
         */
        timeout?: number;
    }
}

declare module "donut.node/module-manager" {
    import { ChannelType, ICommunicatorConstructorOptions } from "donut.node/ipc";
    import { ICommunicator } from "donut.node/remoting";

    export interface IModuleManager {
        getComponentAsync(
            componentIdentity: "ipc.communicator",
            channel: ChannelType,
            options?: ICommunicatorConstructorOptions): Promise<ICommunicator>;
    }
}

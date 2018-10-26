//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IConnectionInfo } from "..";
import * as net from "net";
import { ChannelHostProxy } from "./channel-host-proxy";
import { SocketProxy } from "./socket-proxy";
import * as utils from "../../utils";

export class SocketHostProxy extends ChannelHostProxy<net.Server> {
    public readonly connectionInfo: IConnectionInfo;

    public static generateConnectionInfo(socketServer: net.Server): IConnectionInfo {
        if (!(socketServer instanceof net.Server)) {
            throw new Error("socketServer must be a net.Server object.");
        }

        const handle: any = socketServer["_handle"];

        if (utils.isString(handle._pipeName)) {
            return {
                moduleName: "net",
                initFunction: "createServer",
                initFunctionParams: [{ path: handle._pipeName }]
            };

        } else {
            throw new Error("Unsupported net.Server.");
        }
    }

    constructor(socketServer: net.Server) {
        super(socketServer);

        if (!(socketServer instanceof net.Server)) {
            throw new Error("socketServer must be a net.Server");
        }

        this.connectionInfo = SocketHostProxy.generateConnectionInfo(this.host);

        this.host.on("close", this.onClose);
        this.host.on("connection", this.onConnection);
        this.host.on("error", this.onError);
        this.host.on("listening", this.onListening);
    }

    public disposeAsync(): Promise<void> {
        if (this.disposed) {
            return super.disposeAsync();
        }

        this.host.off("close", this.onClose);
        this.host.off("connection", this.onConnection);
        this.host.off("error", this.onError);
        this.host.off("listening", this.onListening);

        return super.disposeAsync();
    }

    private onConnection = (socket: net.Socket) => this.emit("connection", new SocketProxy(socket));

    private onClose = () => this.emit("close");

    private onError = (error: Error) => this.emit("error", error);

    private onListening = () => this.emit("listening");
}

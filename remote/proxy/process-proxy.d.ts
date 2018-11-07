//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { ChildProcess } from "child_process";
import { ChannelProxy } from "./channel-proxy";

declare export class ProcessProxy extends ChannelProxy<ChildProcess> {
    public static isValidChannel(channel: any): channel is ChildProcess;

    constructor(channel: ChildProcess);
}
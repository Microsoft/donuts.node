//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { Socket, Server } from "net";

declare export function connect(...pathSegements: Array<string>): Socket;

declare export function host(...pathSegements: Array<string>): Server;

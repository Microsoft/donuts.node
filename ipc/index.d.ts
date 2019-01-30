//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { Socket, Server } from "net";

declare export function connectAsync(...pathSegments: Array<string>): Promise<Socket>;

declare export function hostAsync(...pathSegments: Array<string>): Promise<Server>;

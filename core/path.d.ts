//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export function resolve(pathObject: string | import("./path").IPathObject, fromAppDir: boolean = false): string;

declare export function local(target: string, fromAppDir: boolean = false): string;
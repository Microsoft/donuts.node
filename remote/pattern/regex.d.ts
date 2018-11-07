//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export class Regex implements Donuts.Remote.IRoutePattern {
    constructor(pattern: RegExp);

    public getRaw(): any;
    public match(path: string): IRoutePathInfo;
    public equals(pattern: IRoutePattern): boolean;
}
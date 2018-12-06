//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import IMail = Donuts.Remote.PostalService.IMail;

declare export class UrlRegexCondition implements Donuts.ICondition<IMail<any>> {
    public constructor(url: string);

    public match(input: IMail<any>): boolean;
}
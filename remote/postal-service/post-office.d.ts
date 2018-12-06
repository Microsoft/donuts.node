//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { PostMaster } from "./post-master";

import IPostMan = Donuts.Remote.PostalService.IPostMan;
import IPostOffice = Donuts.Remote.PostalService.IPostOffice;

declare export class PostOffice<TOutgoingData, TIncomingData>
    extends PostMaster
    implements IPostOffice<TOutgoingData, TIncomingData> {

    public readonly postmans: Array<IPostMan<TOutgoingData, TIncomingData>>;

    constructor(log?: Donuts.Logging.ILog, id?: string, moduleName?: string);
}
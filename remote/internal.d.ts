//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts.Remote {
    type ProxyAction =
        "Resource.Request" |
        "Resource.Release" |
        "Resource.GetProperty" |
        "Resource.SetProperty" |
        "Resource.Apply";

    interface IProxyMessage {
        action: ProxyAction;
    }

    interface IResourceRequestMessage extends IProxyMessage {
        action: "Resource.Request";
        resourceId: string;
        extraArgs: Array<IDataInfo>
    }

    type DataType = "undefined" | "null" | "object" | "boolean" | "number" | "string" | "symbol" | "function" | "node.buffer";

    interface IDataInfo {
        type: DataType;
        id?: string;
        value?: any;
    }

    interface IObjectDataInfo extends IDataInfo {
        memberInfos: IDictionary<IDataInfo>
    }
}

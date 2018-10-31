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
        identifier: string;
        extraArgs: Array<IDataInfo>
    }

    interface IResourceReleaseMessage extends IProxyMessage {
        action: "Resource.Release";
        refId: string;
    }

    interface IResourceApplyMessage extends IProxyMessage {
        action: "Resource.Apply";
        refId: string;
        thisArg: IDataInfo;
        args: Array<IDataInfo>
    }

    interface IResourceGetPropertyMessage extends IProxyMessage {
        action: "Resource.GetProperty";
        refId: string;
        property: string | number;
    }

    interface IResourceSetPropertyMessage extends IProxyMessage {
        action: "Resource.SetProperty";
        refId: string;
        property: string | number;
        value: IDataInfo;
    }

    type DataType = "undefined" | "null" | "object" | "boolean" | "number" | "string" | "symbol" | "function" | "node.buffer";

    interface IDataInfo {
        type: DataType;
        id?: string;
        value?: any;
    }

    interface IObjectDataInfo extends IDataInfo {
        memberInfos: Object.<string, IDataInfo>
    }
}

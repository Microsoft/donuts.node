//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IDisposable } from "../common";

import * as utils from "../utils";

export interface AsyncRequestHandler {
    (communicator: ICommunicator, path: string, content: any): Promise<any>;
}

export interface IRoutePattern {
    getRaw(): any;
    match(path: string): boolean;
    equals(pattern: IRoutePattern): boolean;
}

export interface ICommunicator extends IDisposable {
    readonly id: string;

    map(pattern: IRoutePattern, asyncHandler: AsyncRequestHandler): void;
    unmap(pattern: IRoutePattern): AsyncRequestHandler;

    sendAsync<TRequest, TResponse>(path: string, content: TRequest): Promise<TResponse>;
}

export function isCommunicator(communicator: any): communicator is ICommunicator {
    return !utils.isNullOrUndefined(communicator)
        && utils.isString(communicator.id)
        && utils.isFunction(communicator.map)
        && utils.isFunction(communicator.unmap)
        && utils.isFunction(communicator.sendAsync);
}

export function isRoutePattern(pattern: IRoutePattern): pattern is IRoutePattern {
    return !utils.isNullOrUndefined(pattern)
        && utils.isFunction(pattern.equals)
        && utils.isFunction(pattern.getRaw)
        && utils.isFunction(pattern.match);
}

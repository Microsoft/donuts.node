//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export function dedication<T>(typeDescriptor: (...args: Array<any>) => any, injects: Array<string>): Donuts.DI.IDiDescriptor<T>;

declare export function singleton<T>(instance: any): Donuts.DI.IDiDescriptor<T>;
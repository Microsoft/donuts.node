//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/// <reference path="./types.common.d.ts" />
/// <reference path="./types.di.d.ts" />
/// <reference path="./logging/types.logging.d.ts" />

/**
 * Sleep for given time.
 * @param ms time in milliseconds.
 */
declare export function sleepAsync(ms: number): Promise<void>;

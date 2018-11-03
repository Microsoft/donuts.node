//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/**
 * @param {number} ms 
 * @return {Promise<void>}
 */
exports.sleepAsync = (ms) => new Promise(resolve => {
    setTimeout(resolve, ms);
});
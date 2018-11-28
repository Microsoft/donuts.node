//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/**
 * Generate a buffer filling with cryptographically strong pseudo-random bytes.
 * @param size The size in bytes.
 * @returns the buffer filling the randomized bytes.
 */
declare export function randomize(size: number): Buffer;

/**
 * Generate a randomized uid.
 * @param size The length in characters. Default: 8.
 * @returns the uid string (hex).
 */
declare export function generateUid(length?: number): string;

/**
 * Generate a randomized uid.
 * @returns A UUID-alike (version 4) string;
 */
declare export function generateUuidAlike(): string;

/**
 * Generate a random unsigned-integer (32-bit).
 * @returns the random unsigned-integer.
 */
declare export function randomUInt(): number;

/**
 * Generate a random unsigned-short (16-bit).
 * @returns the random unsigned-short.
 */
declare export function randomUShort(): number;

/**
 * Generate a random unsigned-byte (8-bit).
 * @returns the random unsigned-byte.
 */
declare export function randomByte(): number;
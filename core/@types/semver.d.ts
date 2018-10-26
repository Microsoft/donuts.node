//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare module "semver" {
    export type ReleaseType = "major" | "premajor" | "minor" | "preminor" | "patch" | "prepatch" | "prerelease";

    export function valid(version: string | SemVer, loose?: boolean): string;

    export function inc(version: string | SemVer, releaseType: ReleaseType, identifier: string): string;
    
    export function inc(version: string | SemVer, releaseType: ReleaseType, loose: boolean, identifier: string): string;

    export function prerelease(version: string | SemVer, loose?: boolean): Array<string>;

    export function major(version: string | SemVer, loose?: boolean): number;

    export function minor(version: string | SemVer, loose?: boolean): number;

    export function patch(version: string | SemVer, loose?: boolean): number;

    export function intersects(range1: string, range2: string, loose?: boolean): string;

    export function clean(version: string | SemVer, loose?: boolean): string;

    export function gt(version1: string | SemVer, version2: string | SemVer, loose?: boolean): boolean;

    export function gte(version1: string | SemVer, version2: string | SemVer, loose?: boolean): boolean;

    export function lt(version1: string | SemVer, version2: string | SemVer, loose?: boolean): boolean;

    export function lte(version1: string | SemVer, version2: string | SemVer, loose?: boolean): boolean;

    export function eq(version1: string | SemVer, version2: string | SemVer, loose?: boolean): boolean;

    export function neq(version1: string | SemVer, version2: string | SemVer, loose?: boolean): boolean;

    export function cmp(
        version1: string | SemVer,
        comparator: "===" | "!==" | "" | "=" | "==" | "!=" | ">" | ">=" | "<" | "<=",
        version2: string | SemVer,
        loose?: boolean): boolean;

    export function compare(version1: string | SemVer, version2: string | SemVer, loose?: boolean): number;

    export function rcompare(version1: string | SemVer, version2: string | SemVer, loose?: boolean): number;

    export function diff(version1: string | SemVer, version2: string | SemVer, loose?: boolean): ReleaseType;

    export function validRange(range: string | Range, loose?: boolean): string;

    export function satisfies(version: string | SemVer, range: string | Range, loose?: boolean): boolean;

    export function maxSatisfying(versions: Array<string | SemVer>, range: string | Range, loose?: boolean): string;

    export function minSatisfying(versions: Array<string | SemVer>, range: string | Range, loose?: boolean): string;

    export function gtr(version: string | SemVer, range: string | Range, loose?: boolean): boolean;

    export function ltr(version: string | SemVer, range: string | Range, loose?: boolean): boolean;

    export function outside(version: string | SemVer, range: string | Range, hilo: ">" | "<", loose?: boolean): boolean;

    export function coerce(version: string | SemVer): string | SemVer;

    export function compareIdentifiers(version1: string, version2: string): number;

    export function rcompareIdentifiers(version1: string, version2: string): number;

    export function toComparators(range: string | Range, loose?: boolean): Array<string>;

    export class Comparator {
        constructor(comp: string | Comparator, loose?: boolean);

        parse(comp: string): void;

        toString(): string;

        test(version: string | SemVer): boolean;

        intersects(comp: Comparator, loose?: boolean): boolean;
    }

    export class SemVer {
        constructor(version: string | SemVer, loose?: boolean);

        format(): string;

        toString(): string;

        compare(other: string | SemVer): number;

        compareMain(other: string | SemVer): number;

        comparePre(other: string | SemVer): number;

        inc(releaseType: ReleaseType, identifier: string): SemVer;
    }

    export class Range {
        constructor(range: string | Range, loose?: boolean);

        format(): string;

        toString(): string;

        parseRange(range: string): Array<string>;

        intersects(range: string | Range, loose?: boolean): Array<string>;
    }
}
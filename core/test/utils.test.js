//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const assert = require("assert");
const utils = require("../utils");

describe("utils", () => {
    describe("exports.number.format()", () => {
        it("Currency (C)", () => {
            try {
                utils.number.format(123, "C");
                assert.fail("No error when currency format is not provided.");
            } catch (error) {
                // Expected error.
            }

            assert.strictEqual(utils.number.format(123, "CUSD"), "$123.00");
            assert.strictEqual(utils.number.format(123456, "cUSD"), "$123,456.00");

            assert.strictEqual(utils.number.format(123, "CCNY"), "CN¥123.00");
            assert.strictEqual(utils.number.format(123456, "cCNY"), "CN¥123,456.00");

            assert.strictEqual(utils.number.format(123, "C1USD"), "$123.0");
            assert.strictEqual(utils.number.format(123456, "c1USD"), "$123,456.0");

            assert.strictEqual(utils.number.format(123, "C6JPY"), "¥123.000000");
            assert.strictEqual(utils.number.format(123456, "c6JPY"), "¥123,456.000000");
        });

        it("Integer (D)", () => {
            try {
                utils.number.format(123.123, "D");
                assert.fail("No error when a non-integer number is provided.");
            } catch (error) {
                // Expected error.
            }

            assert.strictEqual(utils.number.format(123, "D"), "123");
            assert.strictEqual(utils.number.format(123, "D1"), "123");
            assert.strictEqual(utils.number.format(123, "D2"), "123");
            assert.strictEqual(utils.number.format(123, "D3"), "123");
            assert.strictEqual(utils.number.format(123, "D4"), "0123");
            assert.strictEqual(utils.number.format(123, "D5"), "00123");
            assert.strictEqual(utils.number.format(123, "D6"), "000123");
        });

        it("Exponential (E)", () => {
            assert.strictEqual(utils.number.format(1, "E"), "1e+0");
            assert.strictEqual(utils.number.format(10, "E1"), "1.0e+1");
            assert.strictEqual(utils.number.format(100, "E2"), "1.00e+2");
            assert.strictEqual(utils.number.format(1000, "E3"), "1.000e+3");
            assert.strictEqual(utils.number.format(10000, "E4"), "1.0000e+4");
            assert.strictEqual(utils.number.format(100000, "E5"), "1.00000e+5");

            assert.strictEqual(utils.number.format(12345.6789, "e"), "1.23456789e+4");
            assert.strictEqual(utils.number.format(12345.6789, "e1"), "1.2e+4");
            assert.strictEqual(utils.number.format(12345.6789, "e2"), "1.23e+4");
            assert.strictEqual(utils.number.format(12345.6789, "e3"), "1.235e+4");
            assert.strictEqual(utils.number.format(12345.6789, "e4"), "1.2346e+4");
        });

        it("Fixed (F)", () => {
            assert.strictEqual(utils.number.format(1, "F"), "1.000");
            assert.strictEqual(utils.number.format(10, "F1"), "10.0");
            assert.strictEqual(utils.number.format(100, "F2"), "100.00");
            assert.strictEqual(utils.number.format(1000, "F3"), "1000.000");
            assert.strictEqual(utils.number.format(10000, "F4"), "10000.0000");
            assert.strictEqual(utils.number.format(100000, "F5"), "100000.00000");

            assert.strictEqual(utils.number.format(12345.6789, "f"), "12345.679");
            assert.strictEqual(utils.number.format(12345.6789, "f1"), "12345.7");
            assert.strictEqual(utils.number.format(12345.6789, "f2"), "12345.68");
            assert.strictEqual(utils.number.format(12345.6789, "f3"), "12345.679");
            assert.strictEqual(utils.number.format(12345.6789, "f4"), "12345.6789");
            assert.strictEqual(utils.number.format(12345.6789, "f5"), "12345.67890");
        });

        it("Significant (G)", () => {
            assert.strictEqual(utils.number.format(1, "G"), "1");
            assert.strictEqual(utils.number.format(100, "G1"), "1e+2");
            assert.strictEqual(utils.number.format(1000, "G2"), "1.0e+3");
            assert.strictEqual(utils.number.format(10000, "G3"), "1.00e+4");
            assert.strictEqual(utils.number.format(100000, "G4"), "1.000e+5");
            assert.strictEqual(utils.number.format(1000000, "G5"), "1.0000e+6");

            assert.strictEqual(utils.number.format(12345.6789, "g"), "12345.6789");
            assert.strictEqual(utils.number.format(123.6789, "g1"), "1e+2");
            assert.strictEqual(utils.number.format(123.6789, "g2"), "1.2e+2");
            assert.strictEqual(utils.number.format(123.6789, "g3"), "124");
            assert.strictEqual(utils.number.format(123.6789, "g4"), "123.7");
            assert.strictEqual(utils.number.format(123.6789, "g5"), "123.68");
        });

        it("Decimal (N)", () => {
            assert.strictEqual(utils.number.format(123, "N"), "123");
            assert.strictEqual(utils.number.format(123, "N1"), "123.0");
            assert.strictEqual(utils.number.format(123, "N2"), "123.00");
            assert.strictEqual(utils.number.format(123, "N3"), "123.000");
            assert.strictEqual(utils.number.format(123, "N4"), "123.0000");

            assert.strictEqual(utils.number.format(123456, "n"), "123,456");
            assert.strictEqual(utils.number.format(123456789, "n1"), "123,456,789.0");
            assert.strictEqual(utils.number.format(123456789, "n2"), "123,456,789.00");
            assert.strictEqual(utils.number.format(123456789, "n3"), "123,456,789.000");
            assert.strictEqual(utils.number.format(123456789, "n4"), "123,456,789.0000");
        });

        it("Percent (P)", () => {
            assert.strictEqual(utils.number.format(1.23, "P"), "123.00%");
            assert.strictEqual(utils.number.format(1.23, "P0"), "123%");
            assert.strictEqual(utils.number.format(1.23, "P1"), "123.0%");
            assert.strictEqual(utils.number.format(1.23, "P2"), "123.00%");
            assert.strictEqual(utils.number.format(1.23, "P3"), "123.000%");
            assert.strictEqual(utils.number.format(1.23, "P4"), "123.0000%");

            assert.strictEqual(utils.number.format(1.23456, "p"), "123.46%");
            assert.strictEqual(utils.number.format(1.23456789, "p1"), "123.5%");
            assert.strictEqual(utils.number.format(1.23456789, "p2"), "123.46%");
            assert.strictEqual(utils.number.format(1.23456789, "p3"), "123.457%");
            assert.strictEqual(utils.number.format(1.23456789, "p4"), "123.4568%");
        });

        it("Round (R)", () => {
            assert.strictEqual(utils.number.format(1.23456789123456789, "R"), "1.234567891234568");
            assert.strictEqual(utils.number.format(123456789.23456789123456789, "r"), "123456789.2345679");
        });

        it("Hex (X)", () => {
            try {
                utils.number.format(123.123, "X");
                assert.fail("No error when a non-integer number is provided.");
            } catch (error) {
                // Expected error.
            }

            assert.strictEqual(utils.number.format(123, "X"), "7b");
            assert.strictEqual(utils.number.format(123, "X1"), "7b");
            assert.strictEqual(utils.number.format(123, "X2"), "7b");
            assert.strictEqual(utils.number.format(123, "X3"), "07b");
            assert.strictEqual(utils.number.format(123, "X4"), "007b");
        });
    });

    describe("exports.string.format()", () => {
        it("Alignment (Start)", () => {
            assert.strictEqual(utils.string.format("{0,5}", "a"), "    a");
        });

        it("Alignment (End)", () => {
            assert.strictEqual(utils.string.format("{0,-5}", "a"), "a    ");
        });

        it("Indexing", () => {
            assert.strictEqual(utils.string.format("{2,1} {0,-1} {1:a}", "a", "b", "c"), "c a b");
        });

        it("Number", () => {
            assert.strictEqual(utils.string.format("{2,1} {0,-12:cUSD} {1:a}", 1232, "b", "c"), "c $1,232.00    b");
        });

        it("Date", () => {
            assert.strictEqual(utils.string.format("{2,1} {0,12:yyyy-MM-ssTdd:hh:mm} {1:a}", new Date(2018, 11, 20, 13, 50, 56), "b", "c"), "c 2018-11-56T20:01:50 b");
        });

        it("Object", () => {
            assert.strictEqual(utils.string.format("{}", { c: "helloWorld" }), "{\n    \"c\": \"helloWorld\"\n}");
        });

        it("Function", () => {
            assert.strictEqual(utils.string.format("{}", /** @returns {void} */() => undefined), "() => undefined");
        });

        it("null", () => {
            assert.strictEqual(utils.string.format("{}", null), "null");
        });

        it("undefined", () => {
            assert.strictEqual(utils.string.format("{}", undefined), "undefined");
        });

        it("Auto-Indexing", () => {
            assert.strictEqual(utils.string.format("{} {} {}", null, undefined, null), "null undefined null");
        });
    });
});
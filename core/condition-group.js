//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

/**
 * @template T
 * @class
 * @implements {Donuts.ICondition<T>}
 */
class ConditionGroup {
    /**
     * @public
     * @param {Donuts.ConditionalOperator} operator
     */
    constructor(operator) {
        if (operator !== "AND" && operator !== "OR") {
            throw new Error("operator must be either AND or OR.");
        }

        /**
         * @public
         * @type {Donuts.ConditionalOperator}
         */
        this.operator = operator;

        /**
         * @public
         * @readonly
         * @type {Array<Donuts.ICondition<T>>}
         */
        this.conditions = [];
    }

    /**
     * @public
     * @param {T} input
     * @returns {boolean}
     */
    match(input) {
        /** @type {boolean} */
        let result;

        switch (this.operator) {
            case "AND":
                result = true;

                for (const condition of this.conditions) {
                    result = result && condition.match(input);
                }
                break;

            case "OR":
                result = false;

                for (const condition of this.conditions) {
                    result = result || condition.match(input);

                    if (result === true) {
                        break;
                    }
                }
                break;

            default:
                throw new Error(`Invalid operator: ${this.operator}`);

        }

        return result;
    }
}
exports.ConditionGroup = ConditionGroup;
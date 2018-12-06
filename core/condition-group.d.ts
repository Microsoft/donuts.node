//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export class ConditionGroup<T> implements Donuts.ICondition<T> {
    public operator: Donuts.ConditionalOperator;

    public readonly conditions: Array<Donuts.ICondition<T>>;

    public constructor(operator: Donuts.ConditionalOperator);

    public match(input: T): boolean;
}
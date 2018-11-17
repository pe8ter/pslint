/*
    Copyright 2018 Peter Safranek

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import * as ts from 'typescript';
import * as TSlint from 'tslint';

const EXPECT = 'expect';
const EXPECT_ASYNC = 'expectAsync';

// This rule makes sure that Jasmine's `expect()` and `expectAsync()` functions aren't
// called within a `catch` block, which may cause tests to incorrectly succeed.
//
// Parts copied from the TSLint project:
// https://github.com/palantir/tslint/blob/7c841c0/src/rules/banRule.ts

export class Rule extends TSlint.Rules.AbstractRule {

    public static EXPECT_MESSAGE = 'Do not call expect() within a catch block.';
    public static EXPECT_ASYNC_MESSAGE = 'Do not call expectAsync() within a catch block.';

    public apply(sourceFile: ts.SourceFile): TSlint.RuleFailure[] {
        return this.applyWithWalker(new NoCatchExpectWalker(sourceFile, this.getOptions()));
    }
}

class NoCatchExpectWalker extends TSlint.RuleWalker {

    public visitCallExpression(node: ts.CallExpression): void {

        const text = (node.expression as ts.Identifier).text;

        if (text === EXPECT && this._findCatchParent(node)) {
            this.addFailureAtNode(node.expression, Rule.EXPECT_MESSAGE);
        } else if (text === EXPECT_ASYNC && this._findCatchParent(node)) {
            this.addFailureAtNode(node.expression, Rule.EXPECT_ASYNC_MESSAGE);
        }

        super.visitCallExpression(node);
    }

    private _findCatchParent(node: ts.Expression): boolean {

        if (node) {

            if (node.kind === ts.SyntaxKind.CatchClause) {
                return true;
            } else {
                return this._findCatchParent(node.parent as ts.Expression);
            }
        }

        return false;
    }
}

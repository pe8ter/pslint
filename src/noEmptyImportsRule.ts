/**
 * @license
 * Copyright 2018 Peter Safranek
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as ts from 'typescript';
import * as TSLint from 'tslint';

/**
 * This rule makes sure that import statments always import a symbol.
 */

export class Rule extends TSLint.Rules.AbstractRule {

    public static readonly FAILURE_MESSAGE = 'Empty import statement not allowed.';

    public apply(sourceFile: ts.SourceFile): TSLint.RuleFailure[] {
        return this.applyWithWalker(new NoEmptyImportsWalker(sourceFile, this.getOptions()));
    }
}

class NoEmptyImportsWalker extends TSLint.RuleWalker {

    public visitImportDeclaration(node: ts.ImportDeclaration) {

        const namedBindings = node.importClause && node.importClause.namedBindings as ts.NamedImports;
        const elements = namedBindings && namedBindings.elements && namedBindings.elements;

        if (elements && elements.length === 0) {
            const pos = node.importClause!.pos;
            const len = node.importClause!.end - node.importClause!.pos;
            this.addFailureAt(pos, len, Rule.FAILURE_MESSAGE);
        }
    }
}

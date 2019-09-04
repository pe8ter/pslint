/**
 * @license
 * Copyright 2019 Peter Safranek
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

const COMPONENT = 'Component';
const ENCAPSULATION = 'encapsulation';
const VIEW_ENCAPSULATION = 'ViewEncapsulation';

const EMULATED = 'Emulated';
const NONE = 'None';
const SHADOW_DOM = 'ShadowDom';

const ALL_ENCAPSULATION_OPTIONS = [EMULATED, NONE, SHADOW_DOM];
const OBJECT_LITERAL_FAILURE = `Argument to @${COMPONENT}() is not an object literal expression.`;
const REFINEMENT_FAILURE = `The value of the ${ENCAPSULATION} property must be refined from @angular/core's ` +
    'ViewEncapsulation export.';
const MISSING_PROPERTY_FAILURE = `Call to @${COMPONENT} decorator did not include ${ENCAPSULATION} property.`;

/**
 * This rule makes sure that Angular @Component decorations always include a specific view encapsulation.
 * This is helpful when using AOT compilation because there's no way to set Shadow DOM encapsulation as
 * the default. In this case, you're forced to set encapsulation on every component explicitly, which is
 * easy to forget.
 */

export class Rule extends TSLint.Rules.AbstractRule {
    public apply(sourceFile: ts.SourceFile): TSLint.RuleFailure[] {
        validateOptions(this.getOptions().ruleArguments);
        return this.applyWithWalker(new NoCatchExpectWalker(sourceFile, this.getOptions()));
    }
}

function validateOptions(options: string[]): void {
    const acceptedOptions: string[] = [];
    for (const option of options) {
        if (ALL_ENCAPSULATION_OPTIONS.indexOf(option) === -1) {
            const formattedOptions = formatOptions('or');
            throw new Error(`Option "${option}" is not valid. Use any combination of (${formattedOptions}).`);
        }
        if (acceptedOptions.indexOf(option) > -1) {
            throw new Error(`Option "${option}" is already specified.`);
        }
        acceptedOptions.push(option);
    }
}

function formatOptions(conjunction: string): string {
    const quoted = ALL_ENCAPSULATION_OPTIONS.map(s => `"${s}"`);
    return `${quoted.slice(0, -1).join(', ')}, ${conjunction} ${quoted.slice(-1)}`;
}

class NoCatchExpectWalker extends TSLint.RuleWalker {

    // This rule is rigid with how the tested code specifies view encapsulation. The argument to
    // the @Component decorator must be an object literal and the value of the encapsulation property
    // must be refined from @angular/core's ViewEncapsulation export.

    public visitCallExpression(node: ts.CallExpression): void {

        const options = this.getOptions();
        const allowedEncapsulationOptions = options.length === 0 ? ALL_ENCAPSULATION_OPTIONS : options;

        const text = (node.expression as ts.Identifier).text;
        const flags = node.expression.flags;

        // tslint:disable-next-line:no-bitwise
        if ((text === COMPONENT) && (flags & ts.NodeFlags.DecoratorContext)) {

            if (!ts.isObjectLiteralExpression(node.arguments[0])) {
                this.addFailureAtNode(node.arguments[0], OBJECT_LITERAL_FAILURE);
                return;
            }

            const properties = (node.arguments[0] as ts.ObjectLiteralExpression).properties;
            let foundCorrectEncapsulationProperty = false;

            for (const property of properties) {

                // Some properties aren't strings, so skip them.
                if (!property.name || !ts.isIdentifier(property.name!)) {
                    continue;
                }

                // Skip properties that aren't the encapsulation property.
                const identifier = property.name!;
                if (identifier.escapedText !== ENCAPSULATION) {
                    continue;
                }

                const initializer = (property as ts.PropertyAssignment).initializer;

                if (!ts.isPropertyAccessExpression(initializer)) {
                    this.addFailureAtNode(initializer, REFINEMENT_FAILURE);
                    return;
                }

                if (!ts.isIdentifier(initializer.expression)) {
                    this.addFailureAtNode(initializer.expression, REFINEMENT_FAILURE);
                    return;
                }

                if (initializer.expression.escapedText !== VIEW_ENCAPSULATION) {
                    this.addFailureAtNode(initializer.expression, REFINEMENT_FAILURE);
                    return;
                }

                const encapsulationType = initializer.name.escapedText.toString();
                if (allowedEncapsulationOptions.indexOf(encapsulationType) === -1) {
                    this.addFailureAtNode(initializer.name, `Encapsulation type ${encapsulationType} not allowed.`);
                    return;
                }

                foundCorrectEncapsulationProperty = true;
            }

            if (!foundCorrectEncapsulationProperty) {
                this.addFailureAtNode(node.arguments[0], MISSING_PROPERTY_FAILURE);
                return;
            }
        }

        super.visitCallExpression(node);
    }
}

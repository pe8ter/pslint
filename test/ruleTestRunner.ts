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

import { Test } from 'tslint';
import * as glob from 'glob';
import chalk from 'chalk';
import { dirname } from 'path';

// Test runner copied from the TSLint project.
// Credit: https://github.com/palantir/tslint/commit/6b0af8fabb4bc98338d8912a693f5f851812dfff

const RULES_DIRECTORY = 'src/rules';

process.stdout.write(chalk.underline('\nTesting lint rules:\n'));

const testDirectories = glob.sync('test/rules/**/tslint.json').map(dirname);

for (const testDirectory of testDirectories) {

    const results = Test.runTest(testDirectory, RULES_DIRECTORY);
    const didAllTestsPass = Test.consoleTestResultHandler(results, {
        log(m: string) { process.stdout.write(m); },
        error(m: string) { process.stderr.write(m); },
    });

    if (!didAllTestsPass) {
        process.exitCode = 1;
        break;
    }
}

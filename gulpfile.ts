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

import { src, dest, series } from 'gulp';
import * as ts from 'gulp-typescript';
import gulpJsonEditor = require('gulp-json-editor');
import gulpJsonValidator = require('gulp-json-validator');
import tslintPlugin from 'gulp-tslint';
import * as tslint from 'tslint';
import del = require('del');
import pick = require('just-pick');
import { join } from 'path';
import { promisify } from 'util';
import { pipeline as _pipeline } from 'stream';

const pipeline = promisify(_pipeline);

const SRC = 'src';
const DIST = 'dist';

export default series(
    clean,
    lint,
    validateJson,
    transpile,
    copyReadme,
    copyPackageJson,
);

export async function clean() {
    await del(DIST);
}

export async function lint() {
    await pipeline(
        src(['**/*.ts', '!node_modules/**/*.ts', '!dist/**/*.ts']),
        tslintPlugin({
            configuration: 'tslint.json',
            formatter: 'verbose',
            program: tslint.Linter.createProgram('tsconfig.json'),
        }),
        tslintPlugin.report({ emitError: true }),
    );
}

export async function validateJson() {
    await pipeline(
        src(['**/*.json', '!node_modules/**/*.json']),
        gulpJsonValidator(),
    );
}

export async function transpile() {
    await pipeline(
        src(join(SRC, '**/*.ts')),
        ts.createProject('tsconfig.json')(),
        dest(DIST),
    );
}

export async function copyReadme() {
    await pipeline(
        src('README.md'),
        dest(DIST),
    );
}

export async function copyPackageJson() {
    const KEYS = [
        'name',
        'version',
        'description',
        'author',
        'license',
        'homepage',
        'repository',
        'bugs',
        'keywords',
        'engines',
    ];
    await pipeline(
        src('package.json'),
        gulpJsonEditor((json: any) => {
            const devDependencies = json.devDependencies;
            const picked: any = pick(json, KEYS);
            picked.peerDependencies = {
                tslint: devDependencies.tslint,
                typescript: devDependencies.typescript,
            };
            picked.main = 'index.js';
            return picked;
        }),
        dest(DIST),
    );
}

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

import { src, dest, series, parallel } from 'gulp';
import * as ts from 'gulp-typescript';
import gulpJsonEditor = require('gulp-json-editor');
import tslintPlugin from 'gulp-tslint';
import * as tslint from 'tslint';
import * as del from 'del';
import pick = require('just-pick');
import { join } from 'path';

const SRC = 'src';
const DIST = 'dist';

export default series(clean, parallel(transpile, lint, copyReadme, copyPackageJson));

export async function clean() {
    return del(DIST);
}

export async function transpile() {
    return pump(
        src(join(SRC, '**/*.ts')),
        ts.createProject('tsconfig.json')(),
        dest(DIST),
    );
}

export async function lint() {
    return pump(
        src(['**/*.ts', '!node_modules/**/*.ts']),
        tslintPlugin({
            configuration: 'tslint.json',
            formatter: 'verbose',
            program: tslint.Linter.createProgram('tsconfig.json'),
        }),
        tslintPlugin.report({ emitError: true }),
    );
}

export async function copyReadme() {
    return pump(
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

    return pump(
        src('package.json'),
        gulpJsonEditor((json: any) => {
            const tslintVersion = json.devDependencies.tslint;
            const picked: any = pick(json, KEYS);
            picked.peerDependencies = { tslint: tslintVersion };
            return picked;
        }),
        dest(DIST),
    );
}

// ---------------------------------------------------------------------------------------------------------------------

// tslint:disable-next-line:import-blacklist
import _pump = require('pump');

/**
 * Wrap `pump` in a Promise to automatically handle errors passed to its callback.
 */

async function pump(...transformers: NodeJS.ReadWriteStream[]): Promise<void> {

    // TypeScript has trouble with util.promisify when the promisified function
    // has overloaded typings in its .d.ts, so we have to roll our own.
    return new Promise<void>((resolve, reject) => {
        _pump(transformers, (err: any) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

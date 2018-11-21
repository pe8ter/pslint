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
import * as gulpJsonEditor from 'gulp-json-editor';
import * as del from 'del';
import pick = require('just-pick');
import { pump } from './utils';

const DIST = 'dist';

export default series(clean, parallel(transpile, copyReadme, copyPackageJson));

export async function clean() {
    return del(DIST);
}

export async function transpile() {
    const tsProject = ts.createProject('tsconfig.json');
    return pump(
        tsProject.src(),
        tsProject(),
        dest(DIST),
    );
};

export async function copyReadme() {
    return pump(
        src('README.md'),
        dest(DIST),
    );
}

export async function copyPackageJson() {
    return pump(
        src('package.json'),
        gulpJsonEditor((json: any) => {
            const tslint = json.devDependencies.tslint;
            json = pick(json, [
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
            ]);
            json.peerDependencies = { tslint };
            return json;
        }),
        dest(DIST),
    );
}

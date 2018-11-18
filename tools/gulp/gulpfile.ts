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

import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as gulpJsonEditor from 'gulp-json-editor';
import * as runSequence from 'run-sequence';
import * as del from 'del';
import pick = require('just-pick');

const DIST = 'dist';

gulp.task('default', (done) => {
    runSequence('clean', ['build', 'copy.readme', 'copy.package.json'], done);
});

gulp.task('clean', async () => {
    return del(DIST);
});

gulp.task('build', () => {
    const tsProject = ts.createProject('tsconfig.json');
    return tsProject
        .src()
        .pipe(tsProject())
        .js
        .pipe(gulp.dest(DIST));
});

gulp.task('copy.readme', () => {
    return gulp
        .src('README.md')
        .pipe(gulp.dest(DIST));
});

gulp.task('copy.package.json', () => {
    return gulp
        .src('package.json')
        .pipe(gulpJsonEditor((json: any) => {
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
        }))
        .pipe(gulp.dest(DIST));
});

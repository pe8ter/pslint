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

'use strict';

const path = require('path');
const tsNode = require('ts-node');

tsNode.register({
    project: path.join(__dirname, 'tools/gulp/tsconfig.json'),
});

// Gulp tasks go into this TypeScript file.
module.exports = require('./tools/gulp/gulpfile');

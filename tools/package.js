'use strict';

const fs = require('fs')
const packageJson = require('../package.json');

packageJson.peerDependencies = {
    tslint: packageJson.devDependencies.tslint,
};

delete packageJson.scripts;
delete packageJson.devDependencies;

fs.writeFileSync('dist/pslint/package.json', JSON.stringify(packageJson, null, 2));

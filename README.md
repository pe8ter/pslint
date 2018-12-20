# pslint

A collection of useful TSLint rules.

## Rules

* `no-catch-expect`: Prevent calling Jasmine's `expect` and `expectAsync` functions within a `catch` block. If your tested code should throw an exception and you check that by calling `expect` within a `catch` block, then your test might incorrectly succeed if your tested code does not throw an exception. Using this rule forces you to move the `expect` _after_ the `catch` block.
* `no-empty-imports`: Prevent `import` statement from not importing any symbols.

## Prerequisites

This package is an extension of TSLint, therefore you must already have TSLint installed in your project. See https://github.com/palantir/tslint.

## Usage

To consume these rules in your project, first install the module:

```bash
$ npm install --save-dev pslint
```

Then add the rules' location and configurations to your _tslint.json_:

```json
{
  "rulesDirectory": [
    "./node_modules/pslint"
  ],
  "rules": {
    "no-catch-expect": true,
    "no-empty-imports": true
  }
}
```

Note the `peerDependencies` in _package.json_.

## Development

### Build

`pslint` uses Gulp as its task runner. There's no need to install Gulp globally, since it appears in the _package.json_ as a script. All Gulp tasks are written in TypeScript and you can find them in _gulpfile.ts_.

To fully build the project, use the default Gulp task:

```bash
$ npm run gulp
```

To run an individual task, for example, to transpile the TypeScript:

```bash
$ npm run gulp -- transpile
```

### Test

Each rule gets its own directory within _test/rules_. Name the directory the same as the rule file, except drop _Rule_ from the end and convert camel case to kebab case. Example: _noCatchExpectRule.ts_ → _no-catch-expect_. Each directory for rules-under-test needs _test.ts.lint_ to contain the tests and _tslint.json_ to configure TSLint. Test directories can contain arbitrary nesting of sub-test directories so long as each sub-directory has these two files. This is useful for testing multiple configurations of the same rule.

Run the tests:

```bash
$ npm run test
```

### Debug

To debug a rule, set a breakpoint using the `debugger` statement then run

```bash
$ npm run test-debug
```

In Chrome, navigate to _chrome://inspect_ where you'll see the app listed as available for debugging.

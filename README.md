# pslint

A collection of useful TSLint rules.

## Rules

* `no-catch-expect`: Prevent calling Jasmine's `expect` and `expectAsync` functions within a `catch` block. If your tested code should throw an exception and you check that by calling `expect` within a `catch` block, then your test might incorrectly succeed if your tested code does not throw an exception. Using this rule forces you to move the `expect` _after_ the `catch` block.

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
    "no-catch-expect": true
  }
}
```

## Development

`pslint` uses Gulp as its task runner. There's no need to install Gulp globally, since it appears in the _package.json_ as a script. All Gulp tasks are written in TypeScript and you can find them in _gulpfile.ts_.

To fully build the project, use the default Gulp task:

```bash
$ npm run gulp
```

To run an individual task, for example, to just build the TypeScript:

```bash
$ npm run gulp -- transpile
```

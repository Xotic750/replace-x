#!/usr/bin/env node

const parseArguments = require('./parse-arguments-x');
const replace = require('../dist/replace-x');

/* Additional options that apply to `replace`, but not `search` */
const positionalArgs = {
  replacement: {
    position: 1,
    string: true,
    describe: 'Replacement string for matches',
    demandOption: true,
  },
  paths: {
    position: 2,
    array: true,
    describe: 'File or directory to search',
    default: ['*'],
  },
};

const addlOptions = {
  'function-file': {
    alias: 'f',
    describe: 'Path of file containing JS replacement function',
    hidden: true,
  },
  silent: {
    abbr: 's',
    boolean: true,
    describe: "Don't print out anything",
  },
  preview: {
    abbr: 'p',
    boolean: true,
    describe: "Preview the replacements, but don't modify files",
  },
};

const options = parseArguments('replace-x', positionalArgs, addlOptions);

replace(options);

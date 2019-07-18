#!/usr/bin/env node

require('../loadShims');
const nomnom = require('nomnom');
const replace = require('../');
const opts = require('./shared-options-x')();

/* Additional options that apply to `replace`, but not `search` */
Object.assign(opts, {
  replacement: {
    position: 1,
    help: 'Replacement string for matches',
    type: 'string',
    required: true,
  },
  paths: {
    position: 2,
    help: "File or directory to search (default is '*')",
    type: 'string',
    list: true,
    default: ['*'],
  },
  funcFile: {
    abbr: 'f',
    full: 'function-file',
    metavar: 'PATH',
    help: 'file containing JS replacement function',
    hidden: true,
  },
  maxLines: {
    string: '-n NUMLINES',
    help: 'limit the number of lines to preview',
  },
  silent: {
    abbr: 's',
    flag: true,
    help: "Don't print out anything",
  },
  preview: {
    abbr: 'p',
    flag: true,
    help: "Preview the replacements, but don't modify files",
  },
});

const options = nomnom
  .options(opts)
  .script('replace')
  .parse();
replace(options);

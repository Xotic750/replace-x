#!/usr/bin/env node

import '@babel/polyfill';
import nomnom from 'nomnom';
import replace from 'src';
import getSharedOptions from 'src/shared-options-x';

const sharedOptions = getSharedOptions();

/* Additional options that apply to `replace`, but not `search` */
Object.assign(sharedOptions, {
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
  .options(sharedOptions)
  .script('replace')
  .parse();

replace(options);

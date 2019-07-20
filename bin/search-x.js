#!/usr/bin/env node

const nomnom = require('nomnom');
const replace = require('../dist/replace-x');
const sharedOptions = require('./shared-options-x')();

const options = nomnom
  .options(sharedOptions)
  .script('search')
  .parse();
replace(options);

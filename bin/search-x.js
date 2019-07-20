#!/usr/bin/env node

const nomnom = require('nomnom');
const replace = require('../dist/replace-x').default;
const sharedOptions = require('./shared-options-x')();

const options = nomnom
  .options(sharedOptions)
  .script('search-x')
  .parse();
replace(options);

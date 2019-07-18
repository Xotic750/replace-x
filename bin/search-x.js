#!/usr/bin/env node

require('../loadShims');
const nomnom = require('nomnom');
const replace = require('../');
const sharedOptions = require('./shared-options-x')();

const options = nomnom
  .options(sharedOptions)
  .script('search')
  .parse();
replace(options);

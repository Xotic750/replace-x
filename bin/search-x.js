#!/usr/bin/env node

const parseArguments = require('./parse-arguments-x');
const replace = require('../dist/replace-x');

const options = parseArguments('search-x');

replace(options);

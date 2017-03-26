#!/usr/bin/env node

/* eslint sort-keys: 1 */

'use strict';

var nomnom = require('nomnom');
var replace = require('../');
var sharedOptions = require('./shared-options-x');

var options = nomnom.options(sharedOptions).script('search').parse();

replace(options);

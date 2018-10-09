#!/usr/bin/env node

import '@babel/polyfill';
import nomnom from 'nomnom';
import replace from 'src';
import getSharedOptions from 'src/shared-options-x';

const sharedOptions = getSharedOptions();
const options = nomnom
  .options(sharedOptions)
  .script('search')
  .parse();

replace(options);

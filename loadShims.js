require('es5-shim');
require('es6-shim');
const es7 = require('es7-shim');

Object.keys(es7).forEach(function iteratee(key) {
  const obj = es7[key];

  if (typeof obj.shim === 'function') {
    obj.shim();
  }
});

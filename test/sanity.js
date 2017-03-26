/* eslint sort-keys: 1, max-statements: 1 */
/* global JSON:true, describe, it */

'use strict';

require('es5-shim');
require('es5-shim/es5-sham');
if (typeof JSON === 'undefined') {
  JSON = {};
}
require('json3').runInContext(null, JSON);
require('es6-shim');
var es7 = require('es7-shim');
Object.keys(es7).forEach(function (key) {
  var obj = es7[key];
  if (typeof obj.shim === 'function') {
    obj.shim();
  }
});

var expect = require('chai').expect;
var fs = require('fs');
var replace = require('../');

var getText = function (file) {
  return fs.readFileSync(file, 'utf-8');
};

describe('sanity replace', function () {
  it('Basic', function () {
    var file = './test/test_files/test_basic.txt';

    replace({
      regex: 'a',
      replacement: 'b',
      paths: [file]
    });

    var actual = getText(file);
    var expected = 'bbbccc';
    expect(actual).to.equal(expected, 'single letter replace works');

    replace({
      regex: 'b',
      replacement: 'a',
      paths: [file]
    });

    actual = getText(file);
    expected = 'aaaccc';
    expect(actual).to.equal(expected, 'reverting worked');
  });

  it('numbers', function () {
    var file = './test/test_files/test_numbers.txt';

    replace({
      regex: '123',
      replacement: '456',
      paths: [file]
    });

    var actual = getText(file);
    var expected = 'a456b';
    expect(actual).to.equal(expected, 'number replace works');

    replace({
      regex: '456',
      replacement: '123',
      paths: [file]
    });

    actual = getText(file);
    expected = 'a123b';
    expect(actual).to.equal(expected, 'reverting worked');
  });

  it('multiline', function () {
    var file = './test/test_files/test_multiline.txt';

    replace({
      regex: 'c$',
      replacement: 't',
      paths: [file],
      multiline: false
    });

    var actual = getText(file);
    var expected = 'abc\ndef';
    expect(actual).to.equal(expected, "$ shouldn't match without multiline");

    replace({
      regex: 'c$',
      replacement: 't',
      paths: [file],
      multiline: true
    });

    actual = getText(file);
    expected = 'abt\ndef';
    expect(actual).to.equal(expected, 'with multiline, $ should match eol');

    replace({
      regex: 't$',
      replacement: 'c',
      paths: [file],
      multiline: true
    });

    actual = getText(file);
    expected = 'abc\ndef';
    expect(actual).to.equal(expected, 'reverting worked');
  });

  it('case insensitive', function () {
    var file = './test/test_files/test_case.txt';

    replace({
      regex: 'a',
      replacement: 'c',
      paths: [file],
      ignoreCase: true
    });

    var actual = getText(file);
    var expected = 'cccc';
    expect(actual).to.equal(expected, 'case insensitive replace');

    replace({
      regex: 'c',
      replacement: 'A',
      paths: [file]
    });

    actual = getText(file);
    expected = 'AAAA';
    expect(actual).to.equal(expected, 'reverting worked');
  });

  it('preview', function () {
    var file = './test/test_files/test_preview.txt';

    replace({
      regex: 'a',
      replacement: 'c',
      paths: [file],
      preview: true
    });

    var actual = getText(file);
    var expected = 'aaaa';
    expect(actual).to.equal(expected, "no replacement if 'preview' is true");
  });

  it('dot', function () {
    var file = './test/test_files/.test';

    replace({
      regex: 'dot',
      replacement: 'DOT',
      paths: [file],
      recursive: true,
      include: '*',
      dot: true
    });

    var expected = 'DOT';
    expect(getText(file)).to.equal(expected, '- found a file that start with dot');

    replace({
      regex: 'DOT',
      replacement: 'dot',
      paths: [file],
      recursive: true,
      include: '*',
      dot: true
    });

    expected = 'dot';
    expect(getText(file)).to.equal(expected, 'reverting worked');

    replace({
      regex: 'dot',
      replacement: 'DOT',
      paths: [file],
      recursive: true,
      include: '*',
      fileColor: 'red',
      dot: false
    });

    expected = 'dot';
    expect(getText(file)).to.equal(expected, '- default without dot still working');

    replace({
      regex: 'DOT',
      replacement: 'dot',
      paths: [file],
      recursive: true,
      include: '*',
      fileColor: 'red',
      dot: false
    });

    expected = 'dot';
    expect(getText(file)).to.equal(expected, 'reverting worked if mess');

  });
});

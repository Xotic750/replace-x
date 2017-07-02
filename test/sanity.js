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
      paths: [file],
      regex: 'a',
      replacement: 'b'
    });

    var actual = getText(file);
    var expected = 'bbbccc';
    expect(actual).to.equal(expected, 'single letter replace works');

    replace({
      paths: [file],
      regex: 'b',
      replacement: 'a'
    });

    actual = getText(file);
    expected = 'aaaccc';
    expect(actual).to.equal(expected, 'reverting worked');
  });

  it('numbers', function () {
    var file = './test/test_files/test_numbers.txt';

    replace({
      paths: [file],
      regex: '123',
      replacement: '456'
    });

    var actual = getText(file);
    var expected = 'a456b';
    expect(actual).to.equal(expected, 'number replace works');

    replace({
      paths: [file],
      regex: '456',
      replacement: '123'
    });

    actual = getText(file);
    expected = 'a123b';
    expect(actual).to.equal(expected, 'reverting worked');
  });

  it('multiline', function () {
    var file = './test/test_files/test_multiline.txt';

    replace({
      multiline: false,
      paths: [file],
      regex: 'c$',
      replacement: 't'
    });

    var actual = getText(file);
    var expected = 'abc\ndef';
    expect(actual).to.equal(expected, "$ shouldn't match without multiline");

    replace({
      multiline: true,
      paths: [file],
      regex: 'c$',
      replacement: 't'
    });

    actual = getText(file);
    expected = 'abt\ndef';
    expect(actual).to.equal(expected, 'with multiline, $ should match eol');

    replace({
      multiline: true,
      paths: [file],
      regex: 't$',
      replacement: 'c'
    });

    actual = getText(file);
    expected = 'abc\ndef';
    expect(actual).to.equal(expected, 'reverting worked');
  });

  it('case insensitive', function () {
    var file = './test/test_files/test_case.txt';

    replace({
      ignoreCase: true,
      paths: [file],
      regex: 'a',
      replacement: 'c'
    });

    var actual = getText(file);
    var expected = 'cccc';
    expect(actual).to.equal(expected, 'case insensitive replace');

    replace({
      paths: [file],
      regex: 'c',
      replacement: 'A'
    });

    actual = getText(file);
    expected = 'AAAA';
    expect(actual).to.equal(expected, 'reverting worked');
  });

  it('preview', function () {
    var file = './test/test_files/test_preview.txt';

    replace({
      paths: [file],
      preview: true,
      regex: 'a',
      replacement: 'c'
    });

    var actual = getText(file);
    var expected = 'aaaa';
    expect(actual).to.equal(expected, "no replacement if 'preview' is true");
  });

  it('dot', function () {
    var file = './test/test_files/.test';

    replace({
      dot: true,
      include: '*',
      paths: [file],
      recursive: true,
      regex: 'dot',
      replacement: 'DOT'
    });

    var expected = 'DOT';
    expect(getText(file)).to.equal(expected, '- found a file that start with dot');

    replace({
      dot: true,
      include: '*',
      paths: [file],
      recursive: true,
      regex: 'DOT',
      replacement: 'dot'
    });

    expected = 'dot';
    expect(getText(file)).to.equal(expected, 'reverting worked');

    replace({
      dot: false,
      fileColor: 'red',
      include: '*',
      paths: [file],
      recursive: true,
      regex: 'dot',
      replacement: 'DOT'
    });

    expected = 'dot';
    expect(getText(file)).to.equal(expected, '- default without dot still working');

    replace({
      dot: false,
      fileColor: 'red',
      include: '*',
      paths: [file],
      recursive: true,
      regex: 'DOT',
      replacement: 'dot'
    });

    expected = 'dot';
    expect(getText(file)).to.equal(expected, 'reverting worked if mess');

  });
});

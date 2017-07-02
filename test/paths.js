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

describe('paths replace', function () {
  it('recursive', function () {
    replace({
      paths: ['test/test_files/test_paths'],
      recursive: true,
      regex: 'a',
      replacement: 'b'
    });

    var changedFiles = [
      './test/test_files/test_paths/test1.txt',
      './test/test_files/test_paths/test2.txt',
      './test/test_files/test_paths/sample1.txt'
    ];
    var expected = 'bbbb';
    changedFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, 'recursive replace on directory ' + file);
    });

    expected = 'aaaa';
    var ignored = './test/test_files/test_paths/test.png';
    expect(getText(ignored)).to.equal(expected, 'skip file with match in defaultignore');

    replace({
      paths: ['test/test_files/test_paths'],
      recursive: true,
      regex: 'b',
      replacement: 'a'
    });

    changedFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, 'reverting worked');
    });
  });

  it('include', function () {
    replace({
      include: 'sample*.txt',
      paths: ['test/test_files/test_paths'],
      recursive: true,
      regex: 'a',
      replacement: 'b'
    });

    var changedFiles = ['./test/test_files/test_paths/sample1.txt'];
    var expected = 'bbbb';
    changedFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, 'replace in included file ' + file);
    });

    var ignoredFiles = [
      './test/test_files/test_paths/test1.txt',
      './test/test_files/test_paths/test2.txt',
      './test/test_files/test_paths/test.png'
    ];
    expected = 'aaaa';
    ignoredFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, "don't replace in not-included file " + file);
    });

    replace({
      paths: ['test/test_files/test_paths'],
      recursive: true,
      regex: 'b',
      replacement: 'a'
    });

    expected = 'aaaa';
    changedFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, 'reverting worked');
    });
  });

  it('exclude', function () {
    replace({
      exclude: '*sample*.txt',
      paths: ['test/test_files/test_paths'],
      recursive: true,
      regex: 'a',
      replacement: 'b'
    });

    var changedFiles = ['./test/test_files/test_paths/test1.txt', './test/test_files/test_paths/test2.txt'];
    var expected = 'bbbb';
    changedFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, 'replace in non-excluded file ' + file);
    });

    var ignoredFiles = ['./test/test_files/test_paths/sample1.txt', './test/test_files/test_paths/test.png'];
    expected = 'aaaa';
    ignoredFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, "don't replace in excluded file " + file);
    });

    replace({
      paths: ['test/test_files/test_paths'],
      recursive: true,
      regex: 'b',
      replacement: 'a'
    });

    expected = 'aaaa';
    changedFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, 'reverting worked');
    });
  });
});

/* eslint sort-keys: 1, max-statements: 1, max-nested-callbacks:  1 */
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

describe('paths replace', function () {
  it('recursive', function () {
    replace({
      regex: 'a',
      replacement: 'b',
      paths: ['test/test_files/test_paths'],
      recursive: true
    });

    var changedFiles = [
      './test/test_files/test_paths/test1.txt',
      './test/test_files/test_paths/test2.txt',
      './test/test_files/test_paths/sample1.txt'];
    var expected = 'bbbb';
    changedFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, 'recursive replace on directory ' + file);
    });

    expected = 'aaaa';
    var ignored = './test/test_files/test_paths/test.png';
    expect(getText(ignored)).to.equal(expected, 'skip file with match in defaultignore');

    replace({
      regex: 'b',
      replacement: 'a',
      paths: ['test/test_files/test_paths'],
      recursive: true
    });

    changedFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, 'reverting worked');
    });
  });

  it('include', function () {
    replace({
      regex: 'a',
      replacement: 'b',
      paths: ['test/test_files/test_paths'],
      recursive: true,
      include: 'sample*.txt'
    });

    var changedFiles = [
      './test/test_files/test_paths/sample1.txt'
    ];
    var expected = 'bbbb';
    changedFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, 'replace in included file ' + file);
    });

    var ignoredFiles = [
      './test/test_files/test_paths/test1.txt',
      './test/test_files/test_paths/test2.txt',
      './test/test_files/test_paths/test.png'];
    expected = 'aaaa';
    ignoredFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, "don't replace in not-included file " + file);
    });

    replace({
      regex: 'b',
      replacement: 'a',
      paths: ['test/test_files/test_paths'],
      recursive: true
    });

    expected = 'aaaa';
    changedFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, 'reverting worked');
    });
  });

  it('exclude', function () {
    replace({
      regex: 'a',
      replacement: 'b',
      paths: ['test/test_files/test_paths'],
      recursive: true,
      exclude: '*sample*.txt'
    });

    var changedFiles = [
      './test/test_files/test_paths/test1.txt',
      './test/test_files/test_paths/test2.txt'];
    var expected = 'bbbb';
    changedFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, 'replace in non-excluded file ' + file);
    });

    var ignoredFiles = [
      './test/test_files/test_paths/sample1.txt',
      './test/test_files/test_paths/test.png'];
    expected = 'aaaa';
    ignoredFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, "don't replace in excluded file " + file);
    });

    replace({
      regex: 'b',
      replacement: 'a',
      paths: ['test/test_files/test_paths'],
      recursive: true
    });

    expected = 'aaaa';
    changedFiles.forEach(function (file) {
      expect(getText(file)).to.equal(expected, 'reverting worked');
    });
  });
});

const fs = require('fs');
const replace = require('../dist/replace-x').default;

const getText = function(file) {
  return fs.readFileSync(file, 'utf-8');
};

describe('paths replace', function() {
  it('recursive', function() {
    expect.assertions(7);
    replace({
      paths: ['__tests__/test_files/test_paths'],
      recursive: true,
      regex: 'a',
      replacement: 'b',
    });

    const changedFiles = [
      './__tests__/test_files/test_paths/test1.txt',
      './__tests__/test_files/test_paths/test2.txt',
      './__tests__/test_files/test_paths/sample1.txt',
    ];
    let expected = 'bbbb';
    changedFiles.forEach(function(file) {
      expect(getText(file)).toBe(expected, `recursive replace on directory ${file}`);
    });

    expected = 'aaaa';
    const ignored = './__tests__/test_files/test_paths/test.png';
    expect(getText(ignored)).toBe(expected, 'skip file with match in defaultignore');

    replace({
      paths: ['__tests__/test_files/test_paths'],
      recursive: true,
      regex: 'b',
      replacement: 'a',
    });

    changedFiles.forEach(function(file) {
      expect(getText(file)).toBe(expected, 'reverting worked');
    });
  });

  it('include', function() {
    expect.assertions(5);
    replace({
      include: 'sample*.txt',
      paths: ['__tests__/test_files/test_paths'],
      recursive: true,
      regex: 'a',
      replacement: 'b',
    });

    const changedFiles = ['./__tests__/test_files/test_paths/sample1.txt'];
    let expected = 'bbbb';
    changedFiles.forEach(function(file) {
      expect(getText(file)).toBe(expected, `replace in included file ${file}`);
    });

    const ignoredFiles = [
      './__tests__/test_files/test_paths/test1.txt',
      './__tests__/test_files/test_paths/test2.txt',
      './__tests__/test_files/test_paths/test.png',
    ];
    expected = 'aaaa';
    ignoredFiles.forEach(function(file) {
      expect(getText(file)).toBe(expected, `don't replace in not-included file ${file}`);
    });

    replace({
      paths: ['__tests__/test_files/test_paths'],
      recursive: true,
      regex: 'b',
      replacement: 'a',
    });

    expected = 'aaaa';
    changedFiles.forEach(function(file) {
      expect(getText(file)).toBe(expected, 'reverting worked');
    });
  });

  it('exclude', function() {
    expect.assertions(6);
    replace({
      exclude: '*sample*.txt',
      paths: ['__tests__/test_files/test_paths'],
      recursive: true,
      regex: 'a',
      replacement: 'b',
    });

    const changedFiles = ['./__tests__/test_files/test_paths/test1.txt', './__tests__/test_files/test_paths/test2.txt'];
    let expected = 'bbbb';
    changedFiles.forEach(function(file) {
      expect(getText(file)).toBe(expected, `replace in non-excluded file ${file}`);
    });

    const ignoredFiles = ['./__tests__/test_files/test_paths/sample1.txt', './__tests__/test_files/test_paths/test.png'];
    expected = 'aaaa';
    ignoredFiles.forEach(function(file) {
      expect(getText(file)).toBe(expected, `don't replace in excluded file ${file}`);
    });

    replace({
      paths: ['__tests__/test_files/test_paths'],
      recursive: true,
      regex: 'b',
      replacement: 'a',
    });

    expected = 'aaaa';
    changedFiles.forEach(function(file) {
      expect(getText(file)).toBe(expected, 'reverting worked');
    });
  });
});

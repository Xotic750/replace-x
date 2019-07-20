const fs = require('fs');
const replace = require('../dist/replace-x').default;

const getText = function(file) {
  return fs.readFileSync(file, 'utf-8');
};

describe('sanity replace', function() {
  it('basic', function() {
    expect.assertions(2);
    const file = './__tests__/test_files/test_basic.txt';

    replace({
      paths: [file],
      regex: 'a',
      replacement: 'b',
    });

    let actual = getText(file);
    let expected = 'bbbccc';
    expect(actual).toBe(expected, 'single letter replace works');

    replace({
      paths: [file],
      regex: 'b',
      replacement: 'a',
    });

    actual = getText(file);
    expected = 'aaaccc';
    expect(actual).toBe(expected, 'reverting worked');
  });

  it('numbers', function() {
    expect.assertions(2);
    const file = './__tests__/test_files/test_numbers.txt';

    replace({
      paths: [file],
      regex: '123',
      replacement: '456',
    });

    let actual = getText(file);
    let expected = 'a456b';
    expect(actual).toBe(expected, 'number replace works');

    replace({
      paths: [file],
      regex: '456',
      replacement: '123',
    });

    actual = getText(file);
    expected = 'a123b';
    expect(actual).toBe(expected, 'reverting worked');
  });

  it('multiline', function() {
    expect.assertions(3);
    const file = './__tests__/test_files/test_multiline.txt';

    replace({
      multiline: false,
      paths: [file],
      regex: 'c$',
      replacement: 't',
    });

    let actual = getText(file);
    let expected = 'abc\ndef';
    expect(actual).toBe(expected, "$ shouldn't match without multiline");

    replace({
      multiline: true,
      paths: [file],
      regex: 'c$',
      replacement: 't',
    });

    actual = getText(file);
    expected = 'abt\ndef';
    expect(actual).toBe(expected, 'with multiline, $ should match eol');

    replace({
      multiline: true,
      paths: [file],
      regex: 't$',
      replacement: 'c',
    });

    actual = getText(file);
    expected = 'abc\ndef';
    expect(actual).toBe(expected, 'reverting worked');
  });

  it('case insensitive', function() {
    expect.assertions(2);
    const file = './__tests__/test_files/test_case.txt';

    replace({
      ignoreCase: true,
      paths: [file],
      regex: 'a',
      replacement: 'c',
    });

    let actual = getText(file);
    let expected = 'cccc';
    expect(actual).toBe(expected, 'case insensitive replace');

    replace({
      paths: [file],
      regex: 'c',
      replacement: 'A',
    });

    actual = getText(file);
    expected = 'AAAA';
    expect(actual).toBe(expected, 'reverting worked');
  });

  it('preview', function() {
    expect.assertions(1);
    const file = './__tests__/test_files/test_preview.txt';

    replace({
      paths: [file],
      preview: true,
      regex: 'a',
      replacement: 'c',
    });

    const actual = getText(file);
    const expected = 'aaaa';
    expect(actual).toBe(expected, "no replacement if 'preview' is true");
  });

  it('dot', function() {
    expect.assertions(4);
    const file = './__tests__/test_files/.test';

    replace({
      dot: true,
      include: '*',
      paths: [file],
      recursive: true,
      regex: 'dot',
      replacement: 'DOT',
    });

    let expected = 'DOT';
    expect(getText(file)).toBe(expected, '- found a file that start with dot');

    replace({
      dot: true,
      include: '*',
      paths: [file],
      recursive: true,
      regex: 'DOT',
      replacement: 'dot',
    });

    expected = 'dot';
    expect(getText(file)).toBe(expected, 'reverting worked');

    replace({
      dot: false,
      fileColor: 'red',
      include: '*',
      paths: [file],
      recursive: true,
      regex: 'dot',
      replacement: 'DOT',
    });

    expected = 'dot';
    expect(getText(file)).toBe(expected, '- default without dot still working');

    replace({
      dot: false,
      fileColor: 'red',
      include: '*',
      paths: [file],
      recursive: true,
      regex: 'DOT',
      replacement: 'dot',
    });

    expected = 'dot';
    expect(getText(file)).toBe(expected, 'reverting worked if mess');
  });
});

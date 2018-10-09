import '@babel/polyfill';
import fs from 'fs';
import replace from 'src/';

const getText = function _getText(file) {
  return fs.readFileSync(file, 'utf-8');
};

describe('sanity replace', () => {
  it('basic', () => {
    expect.hasAssertions();

    const file = './__tests__/test_files/test_basic.txt';

    replace({
      paths: [file],
      regex: 'a',
      replacement: 'b'
    });

    expect(getText(file)).toStrictEqual('bbbccc', 'single letter replace works');

    replace({
      paths: [file],
      regex: 'b',
      replacement: 'a'
    });

    expect(getText(file)).toStrictEqual('aaaccc', 'reverting worked');
  });

  it('numbers', () => {
    expect.hasAssertions();

    const file = './__tests__/test_files/test_numbers.txt';

    replace({
      paths: [file],
      regex: '123',
      replacement: '456'
    });

    expect(getText(file)).toStrictEqual('a456b', 'number replace works');

    replace({
      paths: [file],
      regex: '456',
      replacement: '123'
    });

    expect(getText(file)).toStrictEqual('a123b', 'reverting worked');
  });

  it('multiline', () => {
    expect.hasAssertions();

    const file = './__tests__/test_files/test_multiline.txt';

    replace({
      multiline: false,
      paths: [file],
      regex: 'c$',
      replacement: 't'
    });

    expect(getText(file)).toStrictEqual('abc\ndef', "$ shouldn't match without multiline");

    replace({
      multiline: true,
      paths: [file],
      regex: 'c$',
      replacement: 't'
    });

    expect(getText(file)).toStrictEqual('abt\ndef', 'with multiline, $ should match eol');

    replace({
      multiline: true,
      paths: [file],
      regex: 't$',
      replacement: 'c'
    });

    expect(getText(file)).toStrictEqual('abc\ndef', 'reverting worked');
  });

  it('case insensitive', () => {
    expect.hasAssertions();

    const file = './__tests__/test_files/test_case.txt';

    replace({
      ignoreCase: true,
      paths: [file],
      regex: 'a',
      replacement: 'c'
    });

    expect(getText(file)).toStrictEqual('cccc', 'case insensitive replace');

    replace({
      paths: [file],
      regex: 'c',
      replacement: 'A'
    });

    expect(getText(file)).toStrictEqual('AAAA', 'reverting worked');
  });

  it('preview', () => {
    expect.hasAssertions();

    const file = './__tests__/test_files/test_preview.txt';

    replace({
      paths: [file],
      preview: true,
      regex: 'a',
      replacement: 'c'
    });

    expect(getText(file)).toStrictEqual('aaaa', "no replacement if 'preview' is true");
  });

  it('dot', () => {
    expect.hasAssertions();

    const file = './__tests__/test_files/.test';

    replace({
      dot: true,
      include: '*',
      paths: [file],
      recursive: true,
      regex: 'dot',
      replacement: 'DOT'
    });

    expect(getText(file)).toStrictEqual('DOT', '- found a file that start with dot');

    replace({
      dot: true,
      include: '*',
      paths: [file],
      recursive: true,
      regex: 'DOT',
      replacement: 'dot'
    });

    expect(getText(file)).toStrictEqual('dot', 'reverting worked');

    replace({
      dot: false,
      fileColor: 'red',
      include: '*',
      paths: [file],
      recursive: true,
      regex: 'dot',
      replacement: 'DOT'
    });

    expect(getText(file)).toStrictEqual('dot', '- default without dot still working');

    replace({
      dot: false,
      fileColor: 'red',
      include: '*',
      paths: [file],
      recursive: true,
      regex: 'DOT',
      replacement: 'dot'
    });

    expect(getText(file)).toStrictEqual('dot', 'reverting worked if mess');
  });
});

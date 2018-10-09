import '@babel/polyfill';
import fs from 'fs';
import replace from 'src/';

const getText = function _getText(file) {
  return fs.readFileSync(file, 'utf-8');
};

describe('paths replace', () => {
  it('recursive', () => {
    expect.hasAssertions();

    replace({
      paths: ['__tests__/test_files/test_paths'],
      recursive: true,
      regex: 'a',
      replacement: 'b'
    });

    const changedFiles = [
      './__tests__/test_files/test_paths/test1.txt',
      './__tests__/test_files/test_paths/test2.txt',
      './__tests__/test_files/test_paths/sample1.txt'
    ];

    changedFiles.forEach((file) => {
      expect(getText(file)).toStrictEqual('bbbb', `recursive replace on directory ${file}`);
    });

    const ignored = './__tests__/test_files/test_paths/test.png';
    expect(getText(ignored)).toStrictEqual('aaaa', 'skip file with match in .defaultignore');

    replace({
      paths: ['__tests__/test_files/test_paths'],
      recursive: true,
      regex: 'b',
      replacement: 'a'
    });

    changedFiles.forEach((file) => {
      expect(getText(file)).toStrictEqual('aaaa', 'reverting worked');
    });
  });

  it('include', () => {
    expect.hasAssertions();

    replace({
      include: 'sample*.txt',
      paths: ['__tests__/test_files/test_paths'],
      recursive: true,
      regex: 'a',
      replacement: 'b'
    });

    const changedFiles = ['./__tests__/test_files/test_paths/sample1.txt'];

    changedFiles.forEach((file) => {
      expect(getText(file)).toStrictEqual('bbbb', `replace in included file ${file}`);
    });

    const ignoredFiles = [
      './__tests__/test_files/test_paths/test1.txt',
      './__tests__/test_files/test_paths/test2.txt',
      './__tests__/test_files/test_paths/test.png'
    ];

    ignoredFiles.forEach((file) => {
      expect(getText(file)).toStrictEqual('aaaa', `don't replace in not-included file ${file}`);
    });

    replace({
      paths: ['__tests__/test_files/test_paths'],
      recursive: true,
      regex: 'b',
      replacement: 'a'
    });

    changedFiles.forEach((file) => {
      expect(getText(file)).toStrictEqual('aaaa', 'reverting worked');
    });
  });

  it('exclude', () => {
    expect.hasAssertions();

    replace({
      exclude: '*sample*.txt',
      paths: ['__tests__/test_files/test_paths'],
      recursive: true,
      regex: 'a',
      replacement: 'b'
    });

    const changedFiles = ['./__tests__/test_files/test_paths/test1.txt', './__tests__/test_files/test_paths/test2.txt'];

    changedFiles.forEach((file) => {
      expect(getText(file)).toStrictEqual('bbbb', `replace in non-excluded file ${file}`);
    });

    const ignoredFiles = ['./__tests__/test_files/test_paths/sample1.txt', './__tests__/test_files/test_paths/test.png'];

    ignoredFiles.forEach((file) => {
      expect(getText(file)).toStrictEqual('aaaa', `don't replace in excluded file ${file}`);
    });

    replace({
      paths: ['__tests__/test_files/test_paths'],
      recursive: true,
      regex: 'b',
      replacement: 'a'
    });

    changedFiles.forEach((file) => {
      expect(getText(file)).toStrictEqual('aaaa', 'reverting worked');
    });
  });
});

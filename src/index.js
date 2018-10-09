import '@babel/polyfill';
import 'colors';
import fs from 'fs';
import path from 'path';
import minimatch from 'minimatch';
import isUndefined from 'lodash/isUndefined';
import isRegex from 'lodash/isRegExp';
import isNull from 'lodash/isNull';
import has from 'lodash/has';
import xRegExp from 'xregexp';
import getSharedOptions from 'src/shared-options-x';

const sharedOptions = getSharedOptions();

const getFlags = function _getFlags(options) {
  let flags = 'g'; // global multiline

  if (options.ignoreCase) {
    flags += 'i';
  }

  if (options.multiline) {
    flags += 'm';
  }

  if (options.unicode) {
    flags += 'u';
  }

  return flags;
};

const getRegExp = function _getRegExp(options) {
  if (isRegex(options.regex) || xRegExp.isRegExp(options.regex)) {
    return options.regex;
  }

  return xRegExp(options.regex, getFlags(options));
};

const getOptionList = function _getOptionList(list, def) {
  return list ? list.split(',') : def;
};

const canSearch = function _canSearch(file, isFile, options) {
  const includes = getOptionList(options.include, null);
  const ignoreFile = options.excludeList || path.join(__dirname, '/.defaultignore');
  const ignores = fs.readFileSync(ignoreFile, options.encoding).split('\n');
  const excludes = getOptionList(options.exclude, []).concat(ignores);
  const inIncludes = includes && includes.some((include) => minimatch(file, include, {dot: options.dot, matchBase: true}));
  const inExcludes = excludes.some((exclude) => minimatch(file, exclude, {dot: options.dot, matchBase: true}));

  return (!includes || !isFile || inIncludes) && !inExcludes;
};

const makeReplaceText = function _makeReplaceText(options, canReplace) {
  let lineCount = 0;
  /*
   * The posix standard specifies that conforming sed implementations shall
   * support at least 8192 byte line lengths.
   */
  const limit = 400; // chars per line
  const regex = getRegExp(options);
  let replaceFunc;

  if (typeof options.funcFile === 'string') {
    // eslint-disable-next-line no-eval
    eval(`replaceFunc = ${fs.readFileSync(options.funcFile, options.encoding)}`);
  }

  const print = function _print(file, match) {
    let printout = options.noColor ? file : file[options.fileColor] || file;

    if (options.count) {
      const count = ` (${match.length})`;
      printout += options.noColor ? count : count.grey;
    }

    process.stdout.write(`${printout}\n`);
  };

  const printer = function _printer(line, index) {
    if (line.match(regex)) {
      lineCount += 1;

      if (lineCount > options.maxLines) {
        return true;
      }

      let replacement = String(options.replacement) || '$&';

      if (!options.noColor) {
        replacement = replacement[options.color];
      }

      const val = line.replace(regex, replaceFunc || replacement).slice(0, limit);
      process.stdout.write(` ${index + 1}: ${val}\n`);
    }

    return false;
  };

  return function replaceText(text, file) {
    const match = text.match(regex);

    if (!match) {
      return null;
    }

    if (!options.silent) {
      print(file, match);
    }

    if (!options.silent && !options.quiet && !(lineCount > options.maxLines) && options.multiline) {
      text.split('\n').some(printer);
    }

    return canReplace ? text.replace(regex, replaceFunc || String(options.replacement)) : undefined;
  };
};

const makeReplaceFile = function _makeReplaceFile(options, canReplace, replacizeText) {
  return function replaceFile(file) {
    const lstatCallback = function _lstatCallback(error, stats) {
      if (error) {
        throw error;
      }

      if (stats.isSymbolicLink()) {
        // don't follow symbolic links for now
        return;
      }

      const isFile = stats.isFile();

      if (!canSearch(file, isFile, options)) {
        return;
      }

      if (isFile) {
        const readFileCallback = function _readFileCallback(err, text) {
          if (err) {
            if (err.code === 'EMFILE') {
              throw new Error('Too many files, try running `replace` without --async');
            }

            throw err;
          }

          const txt = replacizeText(text, file);

          if (canReplace && !isNull(txt)) {
            const writeFileCallback = function _writeFileCallback(e) {
              if (e) {
                throw e;
              }
            };

            fs.writeFile(file, txt, writeFileCallback);
          }
        };

        fs.readFile(file, options.encoding, readFileCallback);
      } else if (options.recursive && stats.isDirectory()) {
        const readdirCallback = function _readdirCallback(err, files) {
          if (err) {
            throw err;
          }

          const filesIteratee = function _filesIteratee(f) {
            replaceFile(path.join(file, f));
          };

          files.forEach(filesIteratee);
        };

        fs.readdir(file, readdirCallback);
      }
    };

    fs.lstat(file, lstatCallback);
  };
};

const makeReplaceFileSync = function makeReplaceFileSync(options, canReplace, replaceText) {
  return function replaceFileSync(file) {
    const stats = fs.lstatSync(file);

    if (stats.isSymbolicLink()) {
      // don't follow symbolic links for now
      return;
    }

    const isFile = stats.isFile();

    if (!canSearch(file, isFile, options)) {
      return;
    }

    if (isFile) {
      if (canReplace) {
        const text = replaceText(fs.readFileSync(file, options.encoding), file);

        if (!isNull(text)) {
          fs.writeFileSync(file, text);
        }
      }
    } else if (stats.isDirectory() && options.recursive) {
      const fileIteratee = function _fileIteratee(f) {
        replaceFileSync(path.join(file, f));
      };

      fs.readdirSync(file).forEach(fileIteratee);
    }
  };
};

export default function replaceX(options) {
  const opts = {...options};
  opts.paths = Array.isArray(opts.paths) ? opts.paths.slice() : sharedOptions.paths.default.slice();

  /*
   * If the path is the same as the default and the recursive option was not
   * specified, search recursively under the current directory as a
   * convenience.
   */
  const pathSame = opts.paths.length === 1 && opts.paths[0] === sharedOptions.paths.default[0];

  if (pathSame && !has(opts, 'recursive')) {
    opts.paths = ['.'];
    opts.recursive = true;
  }

  opts.encoding = sharedOptions.encoding.choices.includes(opts.encoding) ? opts.encoding : 'utf-8';
  opts.color = sharedOptions.color.choices.includes(opts.color) ? opts.color : 'cyan';
  opts.fileColor = sharedOptions.fileColor.choices.includes(opts.fileColor) ? opts.fileColor : 'yellow';
  const canReplace = !opts.preview && !isUndefined(opts.replacement);
  const replaceText = makeReplaceText(opts, canReplace);
  const replaceFile = makeReplaceFile(opts, canReplace, replaceText);
  const replaceFileSync = makeReplaceFileSync(opts, canReplace, replaceText);
  const pathsIteratee = function _pathsIteratee(p) {
    if (opts.async) {
      replaceFile(p);
    } else {
      replaceFileSync(p);
    }
  };

  opts.paths.forEach(pathsIteratee);
}

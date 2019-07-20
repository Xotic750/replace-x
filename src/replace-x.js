import fs from 'fs';
import path from 'path';
import minimatch from 'minimatch';
import isUndefined from 'lodash/isUndefined';
import isRegex from 'is-regexp-x';
import isNull from 'lodash/isNull';
import xRegExp from 'xregexp';
import sharedOptionsFactory from '../bin/shared-options-x';
import 'colors';

const sharedOptions = sharedOptionsFactory();

const hasOwnProp = function hasOwnProp(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

const not = function not(value) {
  return Boolean(value) === false;
};

const isFalsey = function isFalsey(value) {
  return not(value);
};

const isStringType = function isStringType(value) {
  return typeof value === 'string';
};

const getFlags = function getFlags(options) {
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

const getRegExp = function getRegExp(options) {
  if (isRegex(options.regex) || xRegExp.isRegExp(options.regex)) {
    return options.regex;
  }

  return xRegExp(options.regex, getFlags(options));
};

const getOptionList = function getOptionList(list, def) {
  return list ? list.split(',') : def;
};

const canSearch = function canSearch(file, isFile, options) {
  const includes = getOptionList(options.include, null);
  const ignoreFile = options.excludeList || path.join(__dirname, '/defaultignore');
  const ignores = fs.readFileSync(ignoreFile, options.encoding).split('\n');
  const excludes = getOptionList(options.exclude, []).concat(ignores);
  const inIncludes =
    includes &&
    includes.some(function iteratee(include) {
      return minimatch(file, include, {dot: options.dot, matchBase: true});
    });

  const inExcludes = excludes.some(function iteratee(exclude) {
    return minimatch(file, exclude, {dot: options.dot, matchBase: true});
  });

  return (isFalsey(includes) || not(isFile) || inIncludes) && not(inExcludes);
};

const makeReplaceText = function makeReplaceText(options, canReplace) {
  let lineCount = 0;
  // The posix standard specifies that conforming sed implementations shall
  // support at least 8192 byte line lengths.
  const limit = 400; // chars per line
  const regex = getRegExp(options);
  let replaceFunc;

  if (isStringType(options.funcFile)) {
    // noinspection JSUnresolvedFunction
    const funcString = fs.readFileSync(options.funcFile, options.encoding);
    /* eslint-disable-next-line no-eval */
    eval(`replaceFunc = ${funcString}`);
  }

  const print = function print(file, match) {
    let printout = options.noColor ? file : file[options.fileColor] || file;

    if (options.count) {
      const count = ` (${match.length})`;
      printout += options.noColor ? count : count.grey;
    }

    process.stdout.write(`${printout}\n`);
  };

  const printer = function printer(line, index) {
    if (line.match(regex)) {
      lineCount += 1;

      if (lineCount > options.maxLines) {
        return true;
      }

      let replacement = String(options.replacement) || '$&';

      if (isFalsey(options.noColor)) {
        replacement = replacement[options.color];
      }

      const val = line.replace(regex, replaceFunc || replacement).slice(0, limit);
      process.stdout.write(` ${index + 1}: ${val}\n`);
    }

    return false;
  };

  return function replaceText(text, file) {
    const match = text.match(regex);

    if (isFalsey(match)) {
      return null;
    }

    if (isFalsey(options.silent)) {
      print(file, match);
    }

    if (isFalsey(options.silent) && isFalsey(options.quiet) && not(lineCount > options.maxLines) && options.multiline) {
      text.split('\n').some(printer);
    }

    return canReplace ? text.replace(regex, replaceFunc || String(options.replacement)) : undefined;
  };
};

const makeReplacefile = function makeReplacefile(options, canReplace, replacizeText) {
  const rf = function replaceFile(file) {
    fs.lstat(file, function lstat(error, stats) {
      if (error) {
        throw error;
      }

      if (stats.isSymbolicLink()) {
        // don't follow symbolic links for now
        return;
      }

      const isFile = stats.isFile();

      if (not(canSearch(file, isFile, options))) {
        return;
      }

      if (isFile) {
        fs.readFile(file, options.encoding, function readFile(err, text) {
          if (err) {
            if (err.code === 'EMFILE') {
              throw new Error('Too many files, try running `replace` without --async');
            }

            throw err;
          }

          const txt = replacizeText(text, file);

          if (canReplace && not(isNull(txt))) {
            fs.writeFile(file, txt, function writeFile(e) {
              if (e) {
                throw e;
              }
            });
          }
        });
      } else if (stats.isDirectory() && options.recursive) {
        fs.readdir(file, function cb(err, files) {
          if (err) {
            throw err;
          }

          files.forEach(function iteratee(f) {
            rf(path.join(file, f));
          });
        });
      }
    });
  };

  return rf;
};

const makeReplaceFileSync = function makeReplaceFileSync(options, canReplace, replaceText) {
  const rfs = function replaceFileSync(file) {
    const stats = fs.lstatSync(file);

    if (stats.isSymbolicLink()) {
      // don't follow symbolic links for now
      return;
    }

    const isFile = stats.isFile();

    if (not(canSearch(file, isFile, options))) {
      return;
    }

    if (isFile) {
      if (canReplace) {
        const text = replaceText(fs.readFileSync(file, options.encoding), file);

        if (isNull(text) === false) {
          fs.writeFileSync(file, text);
        }
      }
    } else if (stats.isDirectory() && options.recursive) {
      fs.readdirSync(file).forEach(function readdirSync(f) {
        rfs(path.join(file, f));
      });
    }
  };

  return rfs;
};

const replace = function replace(options) {
  const opts = {...options};
  opts.paths = Array.isArray(opts.paths) ? opts.paths.slice() : sharedOptions.paths.default.slice();

  // If the path is the same as the default and the recursive option was not
  // specified, search recursively under the current directory as a
  // convenience.
  const pathSame = opts.paths.length === 1 && opts.paths[0] === sharedOptions.paths.default[0];

  if (pathSame && not(hasOwnProp(opts, 'recursive'))) {
    opts.paths = ['.'];
    opts.recursive = true;
  }

  opts.encoding = sharedOptions.encoding.choices.includes(opts.encoding) ? opts.encoding : 'utf-8';
  opts.color = sharedOptions.color.choices.includes(opts.color) ? opts.color : 'cyan';
  opts.fileColor = sharedOptions.fileColor.choices.includes(opts.fileColor) ? opts.fileColor : 'yellow';
  const canReplace = isFalsey(opts.preview) && not(isUndefined(opts.replacement));
  const replaceText = makeReplaceText(opts, canReplace);
  const replaceFile = makeReplacefile(opts, canReplace, replaceText);
  const replaceFileSync = makeReplaceFileSync(opts, canReplace, replaceText);

  opts.paths.forEach(function iteratee(p) {
    if (opts.async) {
      replaceFile(p);
    } else {
      replaceFileSync(p);
    }
  });
};

export default replace;

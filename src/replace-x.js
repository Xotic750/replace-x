import fs from 'fs';
import path from 'path';
import minimatch from 'minimatch';
import isRegex from 'is-regexp-x';
import xRegExp from 'xregexp';
import sharedOptionsFactory from '../bin/shared-options-x';
import 'colors';

const sharedOptions = sharedOptionsFactory();

const hasOwnProp = Function.call.bind(Object.prototype.hasOwnProperty);

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

  if (options.dotAll) {
    flags += 's';
  }

  if (options.sticky) {
    flags += 'y';
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

  return (!includes || !isFile || inIncludes) && !inExcludes;
};

const makeReplaceText = function makeReplaceText(options, canReplace) {
  let lineCount = 0;
  // The posix standard specifies that conforming sed implementations shall
  // support at least 8192 byte line lengths.
  const limit = 400; // chars per line
  const regex = getRegExp(options);
  let replaceFunc;

  if (typeof options.funcFile === 'string') {
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

const makeReplacefile = function makeReplacefile(options, canReplace, replacizeText) {
  return function replaceFile(file) {
    fs.lstat(file, function lstat(error, stats) {
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
        fs.readFile(file, options.encoding, function readFile(err, text) {
          if (err) {
            if (err.code === 'EMFILE') {
              throw new Error('Too many files, try running `replace` without --async');
            }

            throw err;
          }

          const txt = replacizeText(text, file);

          if (canReplace && txt !== null) {
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
            replaceFile(path.join(file, f));
          });
        });
      }
    });
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

        if (text !== null) {
          fs.writeFileSync(file, text);
        }
      }
    } else if (stats.isDirectory() && options.recursive) {
      fs.readdirSync(file).forEach(function readdirSync(f) {
        replaceFileSync(path.join(file, f));
      });
    }
  };
};

const replace = function replace(options) {
  const opts = {...options};
  const paths = Array.isArray(opts.paths) ? opts.paths : sharedOptions.paths.default;
  opts.paths = paths.slice();

  // If the path is the same as the default and the recursive option was not
  // specified, search recursively under the current directory as a
  // convenience.
  const pathSame = opts.paths.length === 1 && opts.paths[0] === sharedOptions.paths.default[0];

  if (pathSame && !hasOwnProp(opts, 'recursive')) {
    opts.paths = ['.'];
    opts.recursive = true;
  }

  opts.encoding = sharedOptions.encoding.choices.includes(opts.encoding) ? opts.encoding : 'utf-8';
  opts.color = sharedOptions.color.choices.includes(opts.color) ? opts.color : 'cyan';
  opts.fileColor = sharedOptions.fileColor.choices.includes(opts.fileColor) ? opts.fileColor : 'yellow';
  const canReplace = !opts.preview && typeof opts.replacement !== 'undefined';
  const replaceText = makeReplaceText(opts, canReplace);
  const makeReplaceFn = opts.async ? makeReplacefile : makeReplaceFileSync;
  const replaceFileFn = makeReplaceFn(opts, canReplace, replaceText);

  opts.paths.forEach(replaceFileFn);
};

export default replace;

'use strict';

require('./loadShims');
var fs = require('fs');
var path = require('path');
var minimatch = require('minimatch');
var isUndefined = require('validate.io-undefined');
var isRegex = require('is-regex');
var isNull = require('lodash.isnull');
var xRegExp = require('xregexp');
var sharedOptions = require('./bin/shared-options-x')();
require('colors');

var hasOwnProp = function _hasOwnProp(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

var not = function _not(value) {
  return Boolean(value) === false;
};

var isFalsey = function _isFalsey(value) {
  return not(value);
};

var isStringType = function _isStringType(value) {
  return typeof value === 'string';
};

var getFlags = function _getFlags(options) {
  var flags = 'g'; // global multiline
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

var getRegExp = function _getRegExp(options) {
  if (isRegex(options.regex) || xRegExp.isRegExp(options.regex)) {
    return options.regex;
  }

  return xRegExp(options.regex, getFlags(options));
};

var getOptionList = function _getOptionList(list, def) {
  return list ? list.split(',') : def;
};

var canSearch = function _canSearch(file, isFile, options) {
  var includes = getOptionList(options.include, null);
  var ignoreFile = options.excludeList || path.join(__dirname, '/defaultignore');
  var ignores = fs.readFileSync(ignoreFile, options.encoding).split('\n');
  var excludes = getOptionList(options.exclude, []).concat(ignores);
  var inIncludes = includes && includes.some(function _some1(include) {
    return minimatch(file, include, { dot: options.dot, matchBase: true });
  });

  var inExcludes = excludes.some(function _some2(exclude) {
    return minimatch(file, exclude, { dot: options.dot, matchBase: true });
  });

  return (isFalsey(includes) || not(isFile) || inIncludes) && not(inExcludes);
};

var makeReplaceText = function _makeReplaceText(options, canReplace) {
  var lineCount = 0;
  // The posix standard specifies that conforming sed implementations shall
  // support at least 8192 byte line lengths.
  var limit = 400; // chars per line
  var regex = getRegExp(options);
  var replaceFunc;
  if (isStringType(options.funcFile)) {
    // eslint-disable-next-line no-eval
    eval('replaceFunc = ' + fs.readFileSync(options.funcFile, options.encoding));
  }

  var print = function _print(file, match) {
    var printout = options.noColor ? file : file[options.fileColor] || file;
    if (options.count) {
      var count = ' (' + match.length + ')';
      printout += options.noColor ? count : count.grey;
    }

    process.stdout.write(printout + '\n');
  };

  var printer = function _printer(line, index) {
    if (line.match(regex)) {
      lineCount += 1;
      if (lineCount > options.maxLines) {
        return true;
      }

      var replacement = String(options.replacement) || '$&';
      if (isFalsey(options.noColor)) {
        replacement = replacement[options.color];
      }

      var val = line.replace(regex, replaceFunc || replacement).slice(0, limit);
      process.stdout.write(' ' + (index + 1) + ': ' + val + '\n');
    }

    return false;
  };

  return function replaceText(text, file) {
    var match = text.match(regex);
    if (isFalsey(match)) {
      return null;
    }

    if (isFalsey(options.silent)) {
      print(file, match);
    }

    if (isFalsey(options.silent) && isFalsey(options.quiet) && not(lineCount > options.maxLines) && options.multiline) {
      text.split('\n').some(printer);
    }

    return canReplace ? text.replace(regex, replaceFunc || String(options.replacement)) : void 0;
  };
};

var makeReplacefile = function _makeReplacefile(options, canReplace, replacizeText) {
  var rf = function replaceFile(file) {
    fs.lstat(file, function _lstat(error, stats) {
      if (error) {
        throw error;
      }

      if (stats.isSymbolicLink()) {
        // don't follow symbolic links for now
        return;
      }

      var isFile = stats.isFile();
      if (not(canSearch(file, isFile, options))) {
        return;
      }

      if (isFile) {
        fs.readFile(file, options.encoding, function _readFile(err, text) {
          if (err) {
            if (err.code === 'EMFILE') {
              throw new Error('Too many files, try running `replace` without --async');
            }

            throw err;
          }

          var txt = replacizeText(text, file);
          if (canReplace && not(isNull(txt))) {
            fs.writeFile(file, txt, function _writeFile(e) {
              if (e) {
                throw e;
              }
            });
          }
        });
      } else if (stats.isDirectory() && options.recursive) {
        fs.readdir(file, function (err, files) {
          if (err) {
            throw err;
          }

          files.forEach(function _for1(f) {
            rf(path.join(file, f));
          });
        });
      }
    });
  };

  return rf;
};

var makeReplaceFileSync = function _mrfs(options, canReplace, replaceText) {
  var rfs = function replaceFileSync(file) {
    var stats = fs.lstatSync(file);
    if (stats.isSymbolicLink()) {
      // don't follow symbolic links for now
      return;
    }

    var isFile = stats.isFile();
    if (not(canSearch(file, isFile, options))) {
      return;
    }

    if (isFile) {
      if (canReplace) {
        var text = replaceText(fs.readFileSync(file, options.encoding), file);
        if (isNull(text) === false) {
          fs.writeFileSync(file, text);
        }
      }
    } else if (stats.isDirectory() && options.recursive) {
      fs.readdirSync(file).forEach(function _readdirSync(f) {
        rfs(path.join(file, f));
      });
    }
  };

  return rfs;
};

module.exports = function replaceX(options) {
  var opts = Object.assign({}, options);
  opts.paths = Array.isArray(opts.paths) ? opts.paths.slice() : sharedOptions.paths['default'].slice();

  // If the path is the same as the default and the recursive option was not
  // specified, search recursively under the current directory as a
  // convenience.
  var pathSame = opts.paths.length === 1 && opts.paths[0] === sharedOptions.paths['default'][0];
  if (pathSame && not(hasOwnProp(opts, 'recursive'))) {
    opts.paths = ['.'];
    opts.recursive = true;
  }

  opts.encoding = sharedOptions.encoding.choices.includes(opts.encoding) ? opts.encoding : 'utf-8';
  opts.color = sharedOptions.color.choices.includes(opts.color) ? opts.color : 'cyan';
  opts.fileColor = sharedOptions.fileColor.choices.includes(opts.fileColor) ? opts.fileColor : 'yellow';
  var canReplace = isFalsey(opts.preview) && not(isUndefined(opts.replacement));
  var replaceText = makeReplaceText(opts, canReplace);
  var replaceFile = makeReplacefile(opts, canReplace, replaceText);
  var replaceFileSync = makeReplaceFileSync(opts, canReplace, replaceText);

  opts.paths.forEach(function _for2(p) {
    if (opts.async) {
      replaceFile(p);
    } else {
      replaceFileSync(p);
    }
  });
};

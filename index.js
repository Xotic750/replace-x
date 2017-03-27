/* eslint no-magic-numbers: 1, max-statements: 1, no-eval: 1,
   complexity: 1, max-nested-callbacks: 1 */

'use strict';

var forEach = require('foreach');
var fs = require('fs');
var path = require('path');
var colors = require('colors'); // eslint-disable-line no-unused-vars
var minimatch = require('minimatch');
var isUndefined = require('validate.io-undefined');
var isRegex = require('is-regex');
var hasOwnProp = require('has-own-property-x');
var isNull = require('lodash.isnull');
var xRegExp = require('xregexp');
var sharedOptions = require('./bin/shared-options-x')();
require('colors');

var getFlags = function (options) {
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

var getRegExp = function (options) {
  if (isRegex(options.regex) || xRegExp.isRegExp(options.regex)) {
    return options.regex;
  }
  return xRegExp(options.regex, getFlags(options));
};

var getOptionList = function (list, def) {
  return list ? list.split(',') : def;
};

var canSearch = function (file, isFile, options) {
  var includes = getOptionList(options.include, null);
  var ignoreFile = options.excludeList || path.join(__dirname, '/defaultignore');
  var ignores = fs.readFileSync(ignoreFile, options.encoding).split('\n');
  var excludes = getOptionList(options.exclude, []).concat(ignores);
  var inIncludes = includes && includes.some(function (include) {
    return minimatch(file, include, { dot: options.dot, matchBase: true });
  });
  var inExcludes = excludes.some(function (exclude) {
    return minimatch(file, exclude, { dot: options.dot, matchBase: true });
  });
  return (!includes || !isFile || inIncludes) && (!excludes || !inExcludes);
};

var makeReplaceText = function (options, canReplace) {
  var lineCount = 0;
  // XXX The posix standard specifies that conforming sed implementations shall
  // support at least 8192 byte line lengths.
  var limit = 400; // chars per line
  var regex = getRegExp(options);
  var replaceFunc;
  if (options.funcFile) {
    eval('replaceFunc = ' + fs.readFileSync(options.funcFile, options.encoding));
  }

  var print = function (file, match) {
    var printout = options.noColor ? file : file[options.fileColor] || file;
    if (options.count) {
      var count = ' (' + match.length + ')';
      printout += options.noColor ? count : count.grey;
    }

    process.stdout.write(printout + '\n');
  };

  var printer = function (line, index) {
    if (line.match(regex)) {
      lineCount += 1;
      if (lineCount > options.maxLines) {
        return true;
      }

      var replacement = options.replacement || '$&';
      if (!options.noColor) {
        replacement = replacement[options.color];
      }

      var val = line.replace(regex, replaceFunc || replacement).slice(0, limit);
      process.stdout.write(' ' + (index + 1) + ': ' + val + '\n');
    }

    return false;
  };

  return function replaceText(text, file) {
    var match = text.match(regex);
    if (!match) {
      return null;
    }

    if (!options.silent) {
      print(file, match);
    }

    if (!options.silent && !options.quiet && !(lineCount > options.maxLines) && options.multiline) {
      text.split('\n').some(printer);
    }

    if (canReplace) {
      return text.replace(regex, replaceFunc || options.replacement);
    }

    return void 0;
  };
};

var makeReplacefile = function (options, canReplace, replacizeText) {
  var rf = function replaceFile(file) {
    fs.lstat(file, function (error, stats) {
      if (error) {
        throw error;
      }

      if (stats.isSymbolicLink()) {
        // don't follow symbolic links for now
        return;
      }

      var isFile = stats.isFile();
      if (!canSearch(file, isFile, options)) {
        return;
      }

      if (isFile) {
        fs.readFile(file, options.encoding, function (err, text) {
          if (err) {
            if (err.code === 'EMFILE') {
              throw new Error('Too many files, try running `replace` without --async');
            }
            throw err;
          }

          var txt = replacizeText(text, file);
          if (canReplace && !isNull(txt)) {
            fs.writeFile(file, txt, function (e) {
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

          forEach(files, function (f) {
            rf(path.join(file, f));
          });
        });
      }
    });
  };

  return rf;
};

var makeReplaceFileSync = function (options, canReplace, replaceText) {
  var rfs = function replaceFileSync(file) {
    var stats = fs.lstatSync(file);
    if (stats.isSymbolicLink()) {
      // don't follow symbolic links for now
      return;
    }

    var isFile = stats.isFile();
    if (!canSearch(file, isFile, options)) {
      return;
    }

    if (isFile) {
      if (canReplace) {
        var text = replaceText(fs.readFileSync(file, options.encoding), file);
        if (!isNull(text)) {
          fs.writeFileSync(file, text);
        }
      }
    } else if (stats.isDirectory() && options.recursive) {
      forEach(fs.readdirSync(file), function (f) {
        rfs(path.join(file, f));
      });
    }
  };

  return rfs;
};

module.exports = function replaceX(options) {
  // If the path is the same as the default and the recursive option was not
  // specified, search recursively under the current directory as a
  // convenience.
  var pathSame = options.paths.length === 1 && options.paths[0] === sharedOptions.paths.default[0];
  if (pathSame && !hasOwnProp(options, 'recursive')) {
    options.paths = ['.'];
    options.recursive = true;
  }

  options.encoding = options.encoding || 'utf-8';
  options.color = options.color || 'cyan';

  var canReplace = !options.preview && !isUndefined(options.replacement);
  var replaceText = makeReplaceText(options, canReplace);
  var replaceFile = makeReplacefile(options, canReplace, replaceText);
  var replaceFileSync = makeReplaceFileSync(options, canReplace, replaceText);

  forEach(options.paths, function (p) {
    if (options.async) {
      replaceFile(p);
    } else {
      replaceFileSync(p);
    }
  });
};

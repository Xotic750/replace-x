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
  var hasIncludes = Boolean(includes);
  var ignoreFile = options.excludeList || path.join(__dirname, '/defaultignore');
  var ignores = fs.readFileSync(ignoreFile, options.encoding).split('\n');
  var excludes = getOptionList(options.exclude, []).concat(ignores);
  var inIncludes = hasIncludes && includes.some(function _some1(include) {
    return minimatch(file, include, { dot: options.dot, matchBase: true });
  });

  var inExcludes = excludes.some(function _some2(exclude) {
    return minimatch(file, exclude, { dot: options.dot, matchBase: true });
  });

  return (hasIncludes === false || isFile === false || inIncludes) && inExcludes === false;
};

var makeReplaceText = function _makeReplaceText(options, canReplace) {
  var lineCount = 0;
  // The posix standard specifies that conforming sed implementations shall
  // support at least 8192 byte line lengths.
  var limit = 400; // chars per line
  var regex = getRegExp(options);
  var replaceFunc;
  if (options.funcFile) {
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

      var replacement = options.replacement || '$&';
      if (Boolean(options.noColor) === false) {
        replacement = replacement[options.color];
      }

      var val = line.replace(regex, replaceFunc || replacement).slice(0, limit);
      process.stdout.write(' ' + (index + 1) + ': ' + val + '\n');
    }

    return false;
  };

  return function replaceText(text, file) {
    var match = text.match(regex);
    if (Boolean(match) === false) {
      return null;
    }

    var silent = Boolean(options.silent);
    if (silent === false) {
      print(file, match);
    }

    if (silent === false && Boolean(options.quiet) === false && lineCount <= options.maxLines && options.multiline) {
      text.split('\n').some(printer);
    }

    return canReplace ? text.replace(regex, replaceFunc || options.replacement) : void 0;
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
      if (canSearch(file, isFile, options) === false) {
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
          if (canReplace && isNull(txt) === false) {
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

var makeReplaceFileSync = function _makeReplaceFileSync(options, canReplace, replaceText) {
  var rfs = function replaceFileSync(file) {
    var stats = fs.lstatSync(file);
    if (stats.isSymbolicLink()) {
      // don't follow symbolic links for now
      return;
    }

    var isFile = stats.isFile();
    if (canSearch(file, isFile, options) === false) {
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
  // If the path is the same as the default and the recursive option was not
  // specified, search recursively under the current directory as a
  // convenience.
  var pathSame = options.paths.length === 1 && options.paths[0] === sharedOptions.paths.default[0];
  if (pathSame && hasOwnProp(options, 'recursive') === false) {
    options.paths = ['.'];
    options.recursive = true;
  }

  options.encoding = options.encoding || 'utf-8';
  options.color = options.color || 'cyan';

  var canReplace = Boolean(options.preview) === false && isUndefined(options.replacement) === false;
  var replaceText = makeReplaceText(options, canReplace);
  var replaceFile = makeReplacefile(options, canReplace, replaceText);
  var replaceFileSync = makeReplaceFileSync(options, canReplace, replaceText);

  options.paths.forEach(function _for2(p) {
    if (options.async) {
      replaceFile(p);
    } else {
      replaceFileSync(p);
    }
  });
};

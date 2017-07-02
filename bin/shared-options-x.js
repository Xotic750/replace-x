/* eslint sort-keys: 1 */

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

var path = require('path');

module.exports = function getSharedOptions() {
  return {
    regex: {
      position: 0,
      help: "JavaScript regex (XRegExp) for searching file e.g. '\\d+'",
      required: true
    },
    paths: {
      position: 1,
      help: "File or directory to search (default is '*')",
      list: true,
      type: 'string',
      'default': ['*']
    },
    recursive: {
      abbr: 'r',
      flag: true,
      help: 'Recursively search directories'
    },
    ignoreCase: {
      abbr: 'i',
      flag: true,
      help: 'Ignore case when searching'
    },
    multiline: {
      abbr: 'm',
      flag: true,
      help: 'Match line by line, default is true',
      'default': true
    },
    include: {
      string: '--include=PATHS',
      help: "Only search in these files, e.g. '*.js,*.foo'"
    },
    exclude: {
      string: '--exclude=PATHS',
      help: "Don't search in these files, e.g. '*.min.js'"
    },
    excludeList: {
      full: 'exclude-list',
      metavar: 'FILE',
      help: 'File containing a new-line separated list of files to ignore',
      'default': path.join(__dirname, '..', 'defaultignore'),
      hidden: true
    },
    maxLines: {
      string: '-n NUMLINES',
      help: 'limit the number of lines to preview'
    },
    count: {
      abbr: 'c',
      flag: true,
      help: 'display count of occurances in each file'
    },
    quiet: {
      abbr: 'q',
      flag: true,
      help: 'Just print the names of the files matches occured in (faster)'
    },
    color: {
      metavar: 'COLOR',
      help: "highlight color, e.g. 'green' or 'blue'",
      choices: [
        'red',
        'green',
        'blue',
        'cyan',
        'yellow',
        'magenta',
        'bold',
        'italic'
      ],
      'default': 'cyan'
    },
    fileColor: {
      help: "highlight matching file's name in color, e.g. 'green' or 'blue'",
      choices: [
        'red',
        'green',
        'blue',
        'cyan',
        'yellow',
        'magenta',
        'bold',
        'italic'
      ],
      'default': 'yellow'
    },
    async: {
      abbr: 'a',
      flag: true,
      help: 'asynchronously read/write files in directory (faster)',
      hidden: true
    },
    noColor: {
      help: 'Disable color output.',
      flag: true
    },
    dot: {
      help: "when using include option, include files starting with dot, e.g. '.class' or '.project'",
      'default': false
    },
    encoding: {
      help: "Only search in these files, e.g. '*.js,*.foo'",
      choices: ['utf-8', 'utf-16'],
      'default': 'utf-8'
    }
  };
};

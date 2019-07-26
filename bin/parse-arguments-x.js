const assign = require('lodash/assign');
const yargs = require('yargs');
const sharedOptions = require('./shared-options-x')();

module.exports = function parseArguments(scriptName, addlPosArgs, addlOpts) {
  const $addlPosArgs = Array.isArray(addlPosArgs) ? addlPosArgs : [];
  const $addlOpts = assign({}, addlOpts);

  const posArgs = {};
  const opts = {};
  Object.keys(sharedOptions).forEach(function iterateeKeys(name) {
    const option = sharedOptions[name];

    if (typeof option.position === 'number') {
      posArgs[name] = option;
    } else {
      opts[name] = option;
    }
  });

  const options = assign({}, opts, $addlOpts);

  const positionalArgs = [];
  [posArgs, $addlPosArgs].forEach(function iterateeArgs(arg) {
    Object.keys(arg).forEach(function iterateeKeys(name) {
      const posArg = posArgs[name];
      posArg.name = name;
      positionalArgs[posArg.position] = posArg;
    });
  });

  let command = '$0';
  positionalArgs.forEach(function iteratee(positionalArg) {
    let option = positionalArg.name;

    if (positionalArg.array) {
      option += '..';
    }

    if (positionalArg.demandOption) {
      option = `<${option}>`;
    } else {
      option = `[${option}]`;
    }

    command += ` ${option}`;
  });

  return yargs
    .scriptName(scriptName)
    .command(command, '', function cmd(yargsCmd) {
      positionalArgs.forEach(function iteratee(positionalArg) {
        yargsCmd.positional(positionalArg.name, positionalArg);
      });
    })
    .options(options).argv;
};

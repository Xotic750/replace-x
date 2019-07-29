module.exports = {
  env: {
    browser: false,
    commonjs: true,
    jest: false,
    node: true,
  },
  rules: {
    complexity: ['warn', 6],
    'max-lines-per-function': ['warn', {max: 15, skipBlankLines: true, skipComments: true}],
    'max-params': ['warn', 2],
  },
};

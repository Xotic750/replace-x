module.exports = {
  env: {
    browser: true,
    commonjs: true,
    jest: true,
    node: true,
  },
  rules: {
    'jest/no-hooks': 'off',
    'no-void': 'off',
    'lodash/prefer-noop': 'off',
    'compat/compat': 'off',
    'prefer-rest-params': 'off',
    'no-prototype-builtins': 'off',
    'jest/no-standalone-expect': 'off',
    complexity: 'off',
    'max-lines-per-function': 'off',
    'max-params': 'off',
  },
};

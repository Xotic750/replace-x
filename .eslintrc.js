/**
 * @file Manages the root configuration settings for project wide eslint.
 * @see {@link https://eslint.org} For further information.
 */

module.exports = {
  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#specifying-environments}
   */
  env: {
    jest: false,
    node: false,
  },
  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#extending-configuration-files}
   */
  extends: ['@prorenata/eslint-config-vue'],

  /**
   * You can define global variables here.
   *
   * @see {@link https://eslint.org/docs/user-guide/configuring#specifying-globals}
   */
  globals: {},

  /**
   * Sometimes a more fine-controlled configuration is necessary, for example if the configuration
   * for files within the same directory has to be different.
   *
   * @see {@link https://eslint.org/docs/user-guide/configuring#configuration-based-on-glob-patterns}
   */
  overrides: [
    {
      files: ['webpack.config.js', '.eslintrc.js', 'jest.config.js'],
      env: {
        browser: true,
        commonjs: true,
        jest: false,
        node: true,
      },
      rules: {
        complexity: 'off',
        'max-lines-per-function': 'off',
        'max-params': 'off',
      },
    },
  ],

  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#specifying-parser-options}
   */
  parserOptions: {},

  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#configuring-plugins}
   */
  plugins: [],

  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy}
   */
  root: true,

  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#configuring-rules}
   */
  rules: {
    'jsdoc/no-undefined-types': [
      'error',
      {
        definedTypes: ['Readonly', 'ReadonlyArray'],
      },
    ],
    complexity: ['warn', 6],
    'max-lines-per-function': ['warn', {max: 15, skipBlankLines: true, skipComments: true}],
    'max-params': ['error', 2],
  },

  /**
   * Webpack-literate module resolution plugin for eslint-plugin-import.
   *
   * @see {@link https://www.npmjs.com/package/eslint-import-resolver-webpack}
   */
  settings: {},
};

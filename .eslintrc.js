/**
 * @file Manages the root configuration settings for project wide eslint.
 * @see {@link https://eslint.org} For further information.
 */

module.exports = {
  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#specifying-environments}
   */
  env: {},

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
  overrides: [],

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
        definedTypes: [
          'ArrayConstructor',
          'ObjectConstructor',
          'NumberConstructor',
          'StringConstructor',
          'BooleanConstructor',
          'FunctionConstructor',
          'RegExpConstructor',
          'ErrorConstructor',
          'TypeErrorConstructor',
          'SyntaxErrorConstructor',
          'URIErrorConstructor',
          'ReferenceErrorConstructor',
          'EvalErrorConstructor',
          'RangeErrorConstructor',
          'Readonly',
          'ReadonlyArray',
          'Iterator',
        ],
      },
    ],
  },

  /**
   * Webpack-literate module resolution plugin for eslint-plugin-import.
   *
   * @see {@link https://www.npmjs.com/package/eslint-import-resolver-webpack}
   */
  settings: {},
};

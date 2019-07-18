/**
 * @file Manages the root configuration settings for project wide eslint.
 * @copyright Copyright (c) 2017-present, ProReNata AB
 * @module eslint/root/configuration
 * @see {@link https://eslint.org} for further information.
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Eslint rules that differ from airbnb base.
 *
 * @see {@link https://eslint.org/docs/rules/|rules}
 */
const eslintAgreed = {
  camelcase: ['error', {properties: 'never'}], // because Eketorp's property names are camel_case
  curly: ['error', 'all'],
  'padding-line-between-statements': [
    'error',
    {
      blankLine: 'always',
      next: '*',
      prev: ['block', 'block-like', 'cjs-export', 'class', 'export', 'import'],
    },
    {blankLine: 'any', next: 'import', prev: 'import'},
    {blankLine: 'any', next: 'export', prev: 'export'},
    {blankLine: 'always', next: 'export', prev: 'import'},
    {blankLine: 'always', next: 'import', prev: 'export'},
    {blankLine: 'always', next: 'return', prev: '*'},
    {blankLine: 'always', next: 'if', prev: '*'},
  ],
  'no-param-reassign': [
    'error',
    {
      props: false,
    },
  ],
  'no-console': isProduction ? 'error' : 'off',
  'no-debugger': isProduction ? 'error' : 'off',
};

/**
 * Additional ESLint rules for ESLint's directive-comments.
 *
 * @see {@link https://github.com/mysticatea/eslint-plugin-eslint-comments|plugin}
 */
const eslintComments = {
  'eslint-comments/disable-enable-pair': 'error',
  'eslint-comments/no-aggregating-enable': 'error',
  'eslint-comments/no-duplicate-disable': 'error',
  'eslint-comments/no-unlimited-disable': 'error',
  'eslint-comments/no-unused-disable': 'error',
  'eslint-comments/no-unused-enable': 'error',
  'eslint-comments/no-restricted-disable': 'error',
  'eslint-comments/no-use': 'warn',
};

/**
 * Switch-case-specific linting rules for ESLint.
 *
 * @see {@link https://github.com/lukeapage/eslint-plugin-switch-case|plugin}
 */
const eslintSwitchCase = {
  'switch-case/no-case-curly': 'error',
  'switch-case/newline-between-switch-case': ['error', 'always', {fallthrough: 'never'}],
};

/**
 * An ESlint rule plugin companion to babel-eslint.
 *
 * @see {@link https://github.com/babel/eslint-plugin-babel|plugin}
 */
const classProperty = {
  'babel/camelcase': ['error', {properties: 'never'}], // because Eketorp's property names are camel_case
  'babel/new-cap': 'error',
  'babel/no-invalid-this': 'error',
  'babel/object-curly-spacing': 'error',
  'babel/quotes': ['error', 'single', {avoidEscape: true}],
  'babel/semi': 'error',
  'babel/no-unused-expressions': 'error',
  'babel/valid-typeof': 'error',
};

/**
 * ESLint plugin to prevent use of extended native objects.
 *
 * @see {@link https://github.com/dustinspecker/eslint-plugin-no-use-extend-native|plugin}
 */
const extendNative = {
  'no-use-extend-native/no-use-extend-native': 'error',
};

/**
 * ESLint plugin with rules that help validate proper imports.
 *
 * @see {@link https://github.com/benmosher/eslint-plugin-import|plugin}
 */
const importExport = {
  // off because of false positives currently
  'import/no-relative-parent-imports': 'off',
  'import/dynamic-import-chunkname': 'error',
  'import/group-exports': 'off',
  'import/no-cycle': 'error',
  'import/no-default-export': 'off',
  'import/no-named-export': 'off',
  'import/exports-last': 'off',
  'import/no-self-import': 'error',
  'import/no-useless-path-segments': 'error',
  'import/no-unresolved': 'error',
  'import/no-extraneous-dependencies': 'error',
  'import/no-unused-modules': 'off',
};

/**
 * ESLint plugin for Jest.
 *
 * @see {@link https://github.com/jest-community/eslint-plugin-jest|plugin}
 */
const jest = {
  'jest/prefer-inline-snapshots': 'off',
  'jest/no-alias-methods': 'error',
  'jest/consistent-test-it': 'error',
  'jest/lowercase-name': 'error',
  'jest/no-disabled-tests': 'error',
  'jest/no-focused-tests': 'error',
  'jest/no-hooks': 'error',
  'jest/no-identical-title': 'error',
  'jest/no-jasmine-globals': 'off', // off because of false positives currently
  'jest/no-jest-import': 'error',
  'jest/no-large-snapshots': 'error',
  'jest/no-truthy-falsy': 'error',
  'jest/expect-expect': 'error',
  'jest/no-test-return-statement': 'error',
  'jest/prefer-expect-assertions': 'error',
  'jest/no-test-prefixes': 'error',
  'jest/prefer-strict-equal': 'error',
  'jest/prefer-to-be-null': 'error',
  'jest/prefer-to-be-undefined': 'error',
  'jest/prefer-to-contain': 'error',
  'jest/prefer-to-have-length': 'error',
  'jest/require-tothrow-message': 'error',
  'jest/valid-describe': 'error',
  'jest/valid-expect-in-promise': 'error',
  'jest/valid-expect': 'error',
  'jest/no-test-callback': 'error',
  'jest/prefer-spy-on': 'off',
  'jest/prefer-called-with': 'off',
  'jest/prefer-todo': 'error',
  'jest/no-empty-title': 'error',
  'jest/no-mocks-import': 'off',
  'jest/no-commented-out-tests': 'off',
  'jest/no-duplicate-hooks': 'warn',
  'jest/no-if': 'warn',
};

/**
 * JSDoc specific linting rules for ESLint.
 *
 * @see {@link https://github.com/gajus/eslint-plugin-jsdoc|plugin}
 */
const jsdoc = {
  'jsdoc/require-returns-description': 'warn',
  'jsdoc/require-param': 'warn',
  'jsdoc/check-types': 'warn',
  'jsdoc/newline-after-description': 'warn',
  'jsdoc/require-description-complete-sentence': 'warn',
  'jsdoc/require-example': 'off',
  'jsdoc/check-tag-names': 'warn',
  'jsdoc/check-param-names': 'warn',
  'jsdoc/require-description': 'off',
  'jsdoc/require-param-description': 'warn',
  'jsdoc/require-param-type': 'warn',
  'jsdoc/require-hyphen-before-param-description': 'warn',
  'jsdoc/require-returns-type': 'warn',
  'jsdoc/no-undefined-types': 'warn',
  'jsdoc/require-param-name': 'warn',
  'jsdoc/valid-types': 'warn',
  'jsdoc/check-examples': 'warn',
  'jsdoc/require-returns': 'off',
  'jsdoc/require-returns-check': 'off',
  'jsdoc/check-alignment': 'error',
  'jsdoc/check-indentation': 'off',
  'jsdoc/check-syntax': 'error',
  'jsdoc/require-jsdoc': 'off',
  'jsdoc/implements-on-classes': 'error',
  'jsdoc/match-description': 'off',
  'jsdoc/no-types': 'off',
};

/**
 * ESLint rules for lodash.
 *
 * @see {@link https://github.com/wix/eslint-plugin-lodash|plugin}
 */
const lodash = {
  'lodash/prefer-constant': 'off',
  'lodash/prefer-get': 'off',
  'lodash/prefer-includes': 'off',
  'lodash/prefer-is-nil': 'warn',
  'lodash/prefer-lodash-chain': 'off',
  'lodash/prefer-lodash-method': 'off',
  'lodash/prefer-lodash-typecheck': 'off',
  'lodash/prefer-matches': 'off',
  'lodash/prefer-noop': 'error',
  'lodash/prefer-over-quantifier': 'off',
  'lodash/prefer-some': 'off',
  'lodash/prefer-startswith': 'off',
  'lodash/prefer-times': 'off',
};

/**
 * ESLint rule for suggesting that object spread properties be used.
 *
 * @see {@link https://github.com/bryanrsmith/eslint-plugin-prefer-object-spread|plugin}
 */
const objectSpread = {
  'prefer-object-spread/prefer-object-spread': 'error',
};

/**
 * ESLint rule for prettier.
 *
 * @see {@link https://prettier.io/docs/en/eslint.html|plugin}
 */
const prettier = {
  'prettier/prettier': 'error',
};

const promise = {
  'promise/prefer-await-to-callbacks': 'off',
  'promise/prefer-await-to-then': 'off',
};

/**
 * An ESLint rule for enforcing consistent ES6 class member order.
 *
 * @see {@link https://github.com/bryanrsmith/eslint-plugin-sort-class-members|plugin}
 */
const sortClass = {
  'sort-class-members/sort-class-members': [
    'error',
    {
      accessorPairPositioning: 'getThenSet',
      order: [
        '[static-properties]',
        '[static-methods]',
        '[properties]',
        '[conventional-private-properties]',
        'constructor',
        '[methods]',
        '[conventional-private-methods]',
      ],
    },
  ],
};

/** Configuration. */
module.exports = {
  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#specifying-environments|env}
   */
  env: {
    browser: false,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },

  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#extending-configuration-files|extends}
   */
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:eslint-comments/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
    'plugin:promise/recommended',
    'plugin:lodash/recommended',
    'plugin:switch-case/recommended',
  ],

  /**
   * You can define global variables here.
   *
   * @see {@link https://eslint.org/docs/user-guide/configuring#specifying-globals|globals}
   */
  globals: {},

  /**
   * Sometimes a more fine-controlled configuration is necessary, for example if the configuration
   * for files within the same directory has to be different.
   *
   * @see {@link https://eslint.org/docs/user-guide/configuring#configuration-based-on-glob-patterns|overrides}
   */
  overrides: [
    {
      files: ['webpack.*.js'],
      rules: {
        'global-require': 'off',
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true,
          },
        ],
        'no-console': 'off',
        'func-names': 'off',
        'no-new-func': 'off',
        'promise/avoid-new': 'off',
      },
    },
  ],

  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#specifying-parser-options|parserOptions}
   */
  parserOptions: {
    ecmaFeatures: {
      impliedStrict: true,
    },
    ecmaVersion: 2018,
    parser: 'babel-eslint',
    sourceType: 'module',
  },

  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#configuring-plugins|plugins}
   */
  plugins: [
    'babel',
    'eslint-comments',
    'jest',
    'jsdoc',
    'json',
    'lodash',
    'no-use-extend-native',
    'prefer-object-spread',
    'prettier',
    'promise',
    'sort-class-members',
    'switch-case',
  ],

  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy|root}
   */
  root: false,

  /**
   * @see {@link https://eslint.org/docs/user-guide/configuring#configuring-rules|rules
   */
  rules: {
    ...objectSpread,
    ...eslintSwitchCase,
    ...importExport,
    ...promise,
    ...classProperty,
    ...eslintAgreed,
    ...extendNative,
    ...eslintComments,
    ...lodash,
    ...prettier,
    ...jsdoc,
    ...jest,
    ...sortClass,
  },

  /**
   * Webpack-literate module resolution plugin for eslint-plugin-import.
   *
   * @see {@link https://www.npmjs.com/package/eslint-import-resolver-webpack|plugin}
   */
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack.config.js',
      },
    },
    polyfills: [],
  },
};

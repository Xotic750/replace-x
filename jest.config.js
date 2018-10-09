// https://facebook.github.io/jest/docs/en/configuration.html

module.exports = {
  collectCoverage: true,
  coverageDirectory: '__tests__/coverage/',
  collectCoverageFrom: ['<rootDir>/src/index.js', '<rootDir>/src/shared-options-x.js'],
  testMatch: ['**/*.test.js'],
  moduleNameMapper: {
    '^RootDir/(.*)$': '<rootDir>/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  verbose: true,
};

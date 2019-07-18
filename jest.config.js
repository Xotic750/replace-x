// https://facebook.github.io/jest/docs/en/configuration.html

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/index.js'],
  coverageDirectory: '__tests__/coverage/',
  moduleNameMapper: {
    '^RootDir/(.*)$': '<rootDir>/$1',
    '^dist/(.*)$': '<rootDir>/dist/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/*.test.js'],
  verbose: true,
};

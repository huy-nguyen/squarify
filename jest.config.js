module.exports = {
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  'moduleFileExtensions': [
    'ts',
    'tsx',
    'js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '.d.ts'],
  coverageReporters: ['json', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
  ],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!lodash-es)',
  ],
};

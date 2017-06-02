module.exports = {
  transform: {
    '^.+\\.tsx?$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
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
  globals: {
    '__TS_CONFIG__': {
      'module': 'commonjs',
      'jsx': 'react',
    },
  },
  mapCoverage: true,
}

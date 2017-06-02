module.exports = {
  scripts: {
    commit: {
      script: 'git-cz',
      description: 'This uses commitizen to help us generate well formatted commit messages',
    },
    commitmsg: {
      script: 'validate-commit-msg',
      description: 'commit hook to validate commit message',
    },
    clean: {
      script: 'nps clean.main && nps clean.dist && nps clean.esnext',
      main: 'rm -rf lib',
      dist: 'rm -rf dist',
      esnext: 'rm -rf es',
      minify: 'rm -rf dist/index.min.js dist/index.min.js.map',
    },
    minify: {
      script: 'nps clean.minify && uglifyjs dist/index.js -o dist/index.min.js'
    },
    build: {
      script: 'nps build.main && nps build.dist && nps build.esnext',
      main: 'nps clean.main && tsc --p tsconfig.main.json',
      dist: 'nps clean.dist && tsc --p tsconfig.dist.json && nps minify',
      esnext: 'nps clean.esnext && tsc --p tsconfig.esnext.json',
    },
    test: {
      default: {
        script: 'jest --coverage --verbose',
        description: 'Run jest and produce coverage report',
      },
      watch: {
        script: 'jest --watch --verbose',
        description: 'Run jest in watch mode (no coverage)',
      },
      viewCoverageReport: {
        script: 'open coverage/lcov-report/index.html',
        description: 'Show nicely-formatted coverage report (after running nps test)',
      },
    },
    validate: {
      script: 'nps test && nps build',
    }
  },
}

/* eslint-env node */
module.exports = {
  presets: [
    ['@babel/preset-env', {
      'targets': {'node': 'current'},
      'spec': true,
    },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [],
};

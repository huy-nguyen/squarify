import {terser} from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

const shouldMinify = !!process.env.minify;


const commonBabelPluginOptions = {
  exclude: 'node_modules/**',
  extensions: ['.ts'],
};
let babelPlugin;
if (process.env.es5) {
  // Make UMD build (`dist`) be compatible with IE 11.
  babelPlugin = babel({
    ...commonBabelPluginOptions,
    babelrc: false,
    presets: [
      ['@babel/preset-env', {
        'targets': 'ie 11',
      },
      ],
      '@babel/preset-typescript',
    ],
  });
} else {
  // Otherwise,
  babelPlugin = babel(commonBabelPluginOptions);
}

let plugins = [
  resolve(),
  babelPlugin,
];

if (shouldMinify) {
  plugins = [...plugins, terser()];
}

export default {
  input: 'src/index.ts',
  output: {
    sourcemap: true,
  },
  plugins,
};

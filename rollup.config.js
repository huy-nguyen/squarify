import {terser} from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

const shouldMinify = !!process.env.minify;

let plugins = [
  resolve(),
  babel({
    exclude: 'node_modules/**',
    extensions: ['.ts'],
  }),
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

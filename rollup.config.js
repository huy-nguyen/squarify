import typescript from 'rollup-plugin-typescript2';
import {terser} from 'rollup-plugin-terser';
const shouldCompileDeclaration = !!process.env.declaration;
const shouldMinify = !!process.env.minify;

let plugins = [
  typescript({
    tsconfigOverride: {
      compilerOptions: {
        declaration: shouldCompileDeclaration,
      },
    },
    check: true,
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

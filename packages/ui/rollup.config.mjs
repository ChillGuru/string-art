import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';

/* eslint-disable import/no-default-export -- come on man */
/** @type {import('rollup').RollupOptions} */
export default {
  input: 'index.tsx',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
    name: 'UI',
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    postcss({
      modules: true,
      extensions: ['.scss', '.css'],
      extract: true,
    }),
    terser(),
  ],
};

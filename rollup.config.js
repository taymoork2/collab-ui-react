import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import license from 'rollup-plugin-license';
import sass from 'node-sass';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';

import {version} from './package.json';

export default {
  external: ['react', 'react-dom'],
  input: `${__dirname}/src/lib/index.js`,
  output: {
    name: 'CollabUI',
    file: 'umd/collabui.react.min.js',
    format: 'iife', // since this is for the browser only use IIFE instead of UMD
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    },
    sourceMap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    json({
      include: ['src/**', 'node_modules/**']
    }),
    resolve({
      jsnext: true,
      browser: true,
      preferBuiltins: true
    }),
    postcss({
      preprocessor: (content, id) => new Promise((resolve, reject) => {
        const result = sass.renderSync({ file: id });
        resolve({ code: result.css.toString() });
      }),
      plugins: [
        autoprefixer
      ],
      sourceMap: true,
      extract: true,
      extensions: ['.sass','.css']
    }),
    commonjs(),
    globals(),
    builtins(),
    terser(),
    license({
      banner: `/*! Collab UI React v${version} */`
    })
  ]
};

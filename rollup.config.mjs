import {config} from 'dotenv';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import image from '@rollup/plugin-image';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import preserveDirectives from 'rollup-preserve-directives';


config();

const devMode = process.env.NODE_ENV !== 'production';

export default {
   input: 'src/index.js',
   output: {
      file: "dist/index.js",
      format: 'es',
      sourcemap: true,
   },
   plugins: [
      peerDepsExternal(),
      preserveDirectives(),
      nodeResolve({
         extensions: ['.js', '.jsx']
      }),
      babel({
         babelHelpers: 'bundled',
         presets: ['@babel/preset-react'],
         extensions: ['.js', '.jsx'],
         exclude: 'node_modules/**'
      }),
      commonjs(),
      replace({
         preventAssignment: false,
        //  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        //  'process.env.HOSTNAME': JSON.stringify(process.env.HOSTNAME),
        //  'process.env.URL_SANDBOX': JSON.stringify(process.env.URL_SANDBOX),
        //  'process.env.URL_PRODUCTION': JSON.stringify(process.env.URL_PRODUCTION),
      }), 
      json(),
      nodePolyfills(),
      image(),
      terser(),
   ]
}
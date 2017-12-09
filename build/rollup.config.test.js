'use strict'

import { alias } from './project.config'
import multiEntry from 'rollup-plugin-multi-entry'
import replace from 'rollup-plugin-replace'
import coffee from 'rollup-plugin-coffee-script'
import babel from 'rollup-plugin-babel'
import istanbul from 'rollup-plugin-istanbul'

export default {
  input: [
    './test/bootstrap.js',
    './test/**/*.spec.coffee'
  ],
  output: {
    file: './test_gen/specs.bundle.js',
    name: 'specs',
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    multiEntry(),
    alias(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    coffee(),
    babel(),
    istanbul({
      exclude: ['./test/**/*']
    })
  ]
}

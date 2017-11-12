'use strict'

import { alias } from './project.config'
import multiEntry from 'rollup-plugin-multi-entry'
import coffee from 'rollup-plugin-coffee-script'
import babel from 'rollup-plugin-babel'

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
    coffee(),
    babel()
  ]
}

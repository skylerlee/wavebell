'use strict'

import { alias } from './project.config'
import multiEntry from 'rollup-plugin-multi-entry'
import replace from 'rollup-plugin-replace'
import coffee from 'rollup-plugin-coffee-script'
import babel from 'rollup-plugin-babel'
import istanbul from 'rollup-plugin-istanbul'

const replaceConfig = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
}
const istanbulConfig = {
  exclude: ['./test/**/*']
}

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
    replace(replaceConfig),
    coffee(),
    babel(),
    istanbul(istanbulConfig)
  ]
}

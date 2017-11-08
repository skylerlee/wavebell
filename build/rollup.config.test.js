'use strict'

import baseConfig from './rollup.config.base'
import multiEntry from 'rollup-plugin-multi-entry'
import coffee from 'rollup-plugin-coffee-script'
import babel from 'rollup-plugin-babel'

export default Object.assign(baseConfig, {
  input: './test/**/*.spec.coffee',
  output: {
    file: './test_gen/specs.bundle.js',
    name: 'specs',
    format: 'umd'
  },
  plugins: [
    multiEntry(),
    coffee(),
    babel()
  ]
})

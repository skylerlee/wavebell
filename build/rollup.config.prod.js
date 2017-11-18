'use strict'

import { alias } from './project.config'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

export default {
  input: './lib/wavebell.js',
  output: {
    file: './dist/wavebell.js',
    name: 'WaveBell',
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    alias(),
    babel(),
    uglify({
      mangle: { properties: true }
    })
  ]
}

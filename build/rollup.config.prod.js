'use strict'

import { alias } from './project.config'
import babel from 'rollup-plugin-babel'

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
    babel()
  ]
}

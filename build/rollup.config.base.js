'use strict'

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
    babel()
  ]
}

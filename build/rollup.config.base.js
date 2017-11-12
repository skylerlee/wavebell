'use strict'

import path from 'path'
import alias from 'rollup-plugin-alias'
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
    alias({
      '@': path.resolve(__dirname, '../lib')
    }),
    babel()
  ]
}

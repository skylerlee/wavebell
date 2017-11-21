'use strict'

import { suffixed, conf, alias } from './project.config'

export default {
  input: conf.main,
  output: {
    file: suffixed(conf.dest, '.cjs'),
    name: 'WaveBell',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    alias()
  ]
}

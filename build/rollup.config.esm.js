'use strict'

import { suffixed, conf, alias } from './project.config'

export default {
  input: conf.main,
  output: {
    file: suffixed(conf.dest, '.esm'),
    name: 'WaveBell',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    alias()
  ]
}

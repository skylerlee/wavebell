'use strict'

import * as path from 'path'
import rollupAlias from 'rollup-plugin-alias'

let conf = {
  main: './lib/wavebell.js',
  dest: './dist/wavebell.js'
}

let alias = () => rollupAlias({
  '@': path.resolve(__dirname, '../lib')
})

export {
  conf,
  alias
}

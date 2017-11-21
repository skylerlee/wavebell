'use strict'

import * as path from 'path'
import rollupAlias from 'rollup-plugin-alias'

function suffixed (name, suffix) {
  let parts = path.parse(name)
  let filename = parts.name + suffix + parts.ext
  return path.join(parts.dir, filename)
}

let conf = {
  main: './lib/wavebell.js',
  dest: './dist/wavebell.js'
}

let alias = () => rollupAlias({
  '@': path.resolve(__dirname, '../lib')
})

export {
  suffixed,
  conf,
  alias
}

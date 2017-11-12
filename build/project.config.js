'use strict'

import * as path from 'path'
import rollupAlias from 'rollup-plugin-alias'

let alias = () => rollupAlias({
  '@': path.resolve(__dirname, '../lib')
})

export {
  alias
}

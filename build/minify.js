'use strict'

const fs = require('fs')
const uglify = require('uglify-js')

let input = './dist/wavebell.js'
let output = './dist/wavebell.min.js'
let mapfile = output + '.map'

function minify () {
  let code = fs.readFileSync(input, 'utf-8')
  let minified = uglify.minify(code, {
    output: {
      ascii_only: true
    },
    sourceMap: {
      filename: 'wavebell.min.js',
      url: 'wavebell.min.js.map'
    }
  })
  fs.writeFileSync(output, minified.code)
  fs.writeFileSync(mapfile, minified.map)
}

module.export = minify

if (require.main === module) {
  minify()
}

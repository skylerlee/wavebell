'use strict'

import * as fs from 'fs'
import * as uglify from 'uglify-js'

function readFile (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf-8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function writeFile (file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const options = {
  output: {
    ascii_only: true
  },
  sourceMap: true
}

export default function minify (input) {
  return {
    name: 'minify',
    onwrite () {
      readFile(input).then(source => {
        return uglify.minify(source, options)
      }).then(minified => {
        let minFile = input + '.min.js'
        let mapFile = input + '.map'
        writeFile(minFile, minified.code)
        writeFile(mapFile, minified.map)
      })
    }
  }
}

'use strict'

import fs from 'fs'
import path from 'path'
import uglify from 'uglify-js'

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

const defaultOptions = {
  output: {
    ascii_only: true
  }
}

function suffixed (name, suffix) {
  let parts = path.parse(name)
  let filename = parts.name + suffix + parts.ext
  return path.join(parts.dir, filename)
}

function createFileWrap (name, content) {
  let file = {}
  file[name] = content
  return file
}

/**
 * rollup minify plugin
 * This plugin minifies the input file using uglify-js. It's created as a helper
 * to generate a minified bundle without touch the rollup env config.
 * @param {string} input - the file to minify
 * @param {object} option - minify option
 */
export default function minify (input, option = {}) {
  let minFile = suffixed(input, '.min')
  let mapFile = minFile + '.map'
  if (option.sourceMap) {
    defaultOptions.sourceMap = {
      filename: path.basename(minFile),
      url: path.basename(mapFile)
    }
  }
  return {
    name: 'minify',
    // hook onwrite phase
    onwrite () {
      readFile(input).then(source => {
        let file = createFileWrap(path.basename(input), source)
        return uglify.minify(file, defaultOptions)
      }).then(minified => {
        writeFile(minFile, minified.code)
        if (minified.map) {
          writeFile(mapFile, minified.map)
        }
      })
    }
  }
}

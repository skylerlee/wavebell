'use strict'

import * as fs from 'fs'
import * as path from 'path'
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

const defaultOptions = {
  output: {
    ascii_only: true
  }
}

function getMinFileName (name) {
  let props = path.parse(name)
  let minName = props.name + '.min' + props.ext
  return path.join(props.dir, minName)
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
  let minFile = getMinFileName(input)
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

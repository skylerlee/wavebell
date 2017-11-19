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
    onwrite () {
      readFile(input).then(source => {
        return uglify.minify(source, defaultOptions)
      }).then(minified => {
        writeFile(minFile, minified.code)
        if (minified.map) {
          writeFile(mapFile, minified.map)
        }
      })
    }
  }
}

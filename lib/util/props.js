/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

class PropPath {
  constructor (path) {
    this.steps = path.split('.')
  }

  getFrom (obj) {
  }

  hasBy (obj) {
  }

  hasOwnBy (obj) {
  }
}

function props (path) {
  if (typeof path !== 'string') {
    throw new TypeError(path + ' is not a string')
  }
  return new PropPath(path)
}

export default props

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

class PropPath {
  constructor (path) {
    this.steps = path.split('.')
    this.fallback = undefined
  }

  travel (target, fn) {
    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not a function')
    }
    let len = this.steps.length
    let i = 0
    while (i < len && target != undefined) {
      target = fn(target, this.steps[i])
      i++
    }
    return {
      step: 1,
      value: target
    }
  }

  or (defaultValue) {
    this.fallback = defaultValue
    return this
  }

  from (obj) {
  }

  hadBy (obj) {
  }

  ownedBy (obj) {
  }
}

function props (path) {
  if (typeof path !== 'string') {
    throw new TypeError(path + ' is not a string')
  }
  return new PropPath(path)
}

export default props

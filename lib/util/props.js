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
    let step = this.steps[i]
    while (fn(target, step) && i < len) {
      target = target[step]
      step = this.steps[++i]
    }
    return {
      step: i,
      value: target
    }
  }

  or (defaultValue) {
    this.fallback = defaultValue
    return this
  }

  from (obj) {
    let ret = this.travel(obj, (value, step) => {
      return step in Object(value)
    })
    if (ret.step === this.steps.length) {
      return ret.value
    } else {
      return this.fallback
    }
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

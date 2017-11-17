/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

class Assertion {
  constructor (value) {
    this.value = value
    this._negative = false
    this._error = new Error('Assertion failed')
  }

  get to () {
    return this
  }

  get not () {
    this._negative = !this._negative
    return this
  }

  that (error) {
    this._error = error
    return this
  }

  equal (value) {
    if ((value === this.value) === this._negative) {
      throw this._error
    }
  }
}

function assert (value) {
  return new Assertion(value)
}

export default assert

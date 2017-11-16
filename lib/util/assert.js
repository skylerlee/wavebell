/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

class Assertion {
  constructor (value) {
    this.value = value
    this.negative = false
  }

  get to () {
    return this
  }

  get not () {
    this.negative = !this.negative
    return this
  }

  equal (value) {
    if ((value === this.value) === this.negative) {
      throw new Error('Assertion failed')
    }
  }
}

function assert (value) {
  return new Assertion(value)
}

export default assert

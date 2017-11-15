/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

import { getUserMicrophone } from './user_media'

class Recorder {
  constructor () {
    this._intern = null
  }

  get state () {
    if (this._intern === null) {
      return 'closed'
    } else {
      return this._intern.state
    }
  }

  open () {
  }

  close () {
  }

  start (timeslice) {
    this._intern.start(timeslice)
  }

  stop () {
    this._intern.stop()
  }

  pause () {
    this._intern.pause()
  }

  resume () {
    this._intern.resume()
  }
}

export default Recorder

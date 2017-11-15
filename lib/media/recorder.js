/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

import Emitter from '@/util/emitter'
import { getUserMicrophone } from './user_media'

class Recorder extends Emitter {
  constructor () {
    super()
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
    getUserMicrophone().then(stream => {
      // create internal recorder
      this._intern = new MediaRecorder(stream)
      // register event listeners
      let eventTypes = ['error', 'pause', 'resume', 'start', 'stop']
      eventTypes.map(type => {
        this._intern.addEventListener(type, e => this.emit(type, e))
      })
    })
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

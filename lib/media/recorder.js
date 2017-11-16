/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

import Emitter from '@/util/emitter'
import VolumeMeter from './volume_meter'
import { getUserMicrophone } from './user_media'

function assertState (cond, that, name) {
  if (!cond) {
    throw new Error(`Failed to execute '${name}' on 'Recorder': ` +
    `The Recorder's state is '${that.state}'.`)
  }
}

class Recorder extends Emitter {
  constructor (options) {
    super()
    this.options = options || {
      mimeType: 'audio/webm'
    }
    this._intern = null
    this._filter = new VolumeMeter(this)
  }

  get state () {
    if (this._intern === null) {
      return 'closed'
    } else {
      return this._intern.state
    }
  }

  open () {
    assertState(this.state === 'closed', this, 'open')
    getUserMicrophone().then(stream => {
      // create internal recorder
      this._intern = new MediaRecorder(stream, this.options)
      // register event listeners
      let eventTypes = ['error', 'pause', 'resume', 'start', 'stop']
      eventTypes.map(type => {
        this._intern.addEventListener(type, e => this.emit(type, e))
      })
      // pipe stream to filter
      this._filter.pipe(stream)
      this.emit('open')
    })
  }

  close () {
    assertState(this.state !== 'closed', this, 'close')
    this._filter.cutoff()
    this._intern = null
    this.emit('close')
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

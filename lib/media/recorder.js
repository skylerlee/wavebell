/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

import Emitter from '@/util/emitter'
import assert from '@/util/assert'
import VolumeMeter from './volume_meter'
import { getUserMicrophone } from './user_media'

function buildError (self, callee) {
  return new Error(`Failed to execute '${callee}' on 'Recorder':\n` +
    `The Recorder's state is '${self.state}'.`)
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
      return 'inactive'
    } else {
      return this._intern.state
    }
  }

  get ready () {
    return this._intern !== null
  }

  open () {
    return getUserMicrophone().then(stream => {
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
    this._filter.cutoff()
    this._intern = null
    this.emit('close')
  }

  start (timeslice) {
    assert(this.state).that(buildError(this, 'start')).to.equal('inactive')
    if (!this.ready) {
      this.open().then(() => {
        this._intern.start(timeslice)
      })
    } else {
      this._intern.start(timeslice)
    }
  }

  stop () {
    assert(this.state).that(buildError(this, 'stop')).to.not.equal('inactive')
    this._intern.stop()
  }

  pause () {
    assert(this.state).that(buildError(this, 'pause')).to.equal('recording')
    this._intern.pause()
  }

  resume () {
    assert(this.state).that(buildError(this, 'resume')).to.equal('paused')
    this._intern.resume()
  }
}

export default Recorder

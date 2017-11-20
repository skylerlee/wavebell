/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

import AudioFilter from './audio_filter'

class VolumeMeter extends AudioFilter {
  constructor (mainbus, options) {
    super()
    this.mainbus = mainbus
    this.options = Object.assign({
      minLimit: 0,
      maxLimit: 128,
      fftSize: 1024,
      smoothingTimeConstant: 0.3
    }, options)
    this._checkOptions(this.options)
    this.source = null
    this.analyser = this.init(this.options)
  }

  _checkOptions (options) {
    if (options.maxLimit <= options.minLimit) {
      throw new RangeError('Wrong limit range for volume')
    }
  }

  init (options) {
    // init analyser from options
    /// ref: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
    let analyser = this.context.createAnalyser()
    analyser.fftSize = options.fftSize
    analyser.smoothingTimeConstant = options.smoothingTimeConstant

    // use auto buffer size and only 1 I/O channel
    /// ref: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createScriptProcessor
    let processor = this.context.createScriptProcessor(0, 1, 1)
    processor.onaudioprocess = e => {
      if (this.mainbus.state === 'recording') {
        this._processData(e)
      }
    }

    // connect processing pipeline
    /// ref: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamSource
    analyser.connect(processor)
    processor.connect(this.context.destination)

    return analyser
  }

  pipe (stream) {
    // connect source stream
    this.source = this.context.createMediaStreamSource(stream)
    this.source.connect(this.analyser)
  }

  cutoff () {
    this.source.disconnect(this.analyser)
    this.source = null
  }

  _processData (e) {
    // half of the fftSize
    let data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(data)
    let volume = this._calcAvgVolume(data)
    this.mainbus.emit('wave', {
      value: this._alignVolume(volume)
    })
  }

  _alignVolume (volume) {
    let opts = this.options
    if (volume < opts.minLimit) {
      volume = opts.minLimit
    }
    if (volume > opts.maxLimit) {
      volume = opts.maxLimit
    }
    return volume / (opts.maxLimit - opts.minLimit)
  }

  _calcAvgVolume (data) {
    let sum = 0
    let len = data.length
    for (let i = 0; i < len; i++) {
      sum += data[i]
    }
    return sum / len
  }
}

export default VolumeMeter

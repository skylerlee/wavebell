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
      smoothing: 0.3
    }, options)
    this._checkOptions(this.options)
    this.source = null
    this.analyser = this._initAnalyser(this.options)
  }

  _checkOptions (options) {
    if (options.maxLimit <= options.minLimit) {
      throw new RangeError('Wrong limit range for volume')
    }
  }

  _initAnalyser (options) {
    // init analyser from options
    /// ref: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
    let analyser = this.context.createAnalyser()
    analyser.fftSize = options.fftSize
    analyser.smoothingTimeConstant = options.smoothing
    // process data when available
    this.mainbus.on('dataavailable', e => this._processData())
    return analyser
  }

  pipe (stream) {
    // connect stream pipe
    this.source = this.context.createMediaStreamSource(stream)
    this.source.connect(this.analyser)
    this.analyser.connect(this.context.destination)
  }

  cutoff () {
    this.analyser.disconnect(this.context.destination)
    this.source.disconnect(this.analyser)
    this.source = null
  }

  _processData () {
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
    return (volume - opts.minLimit) / (opts.maxLimit - opts.minLimit)
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

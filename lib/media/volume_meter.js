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
    this.options = options || {
      fftSize: 2048
    }
    this.analyser = this.init(this.context, this.options)
  }

  init (ctx, opt) {
    // use 2048 bytes for fft and 0 smoothing
    /// ref: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
    let analyser = ctx.createAnalyser()
    analyser.fftSize = opt.fftSize
    analyser.smoothingTimeConstant = 0

    // use auto buffer size and only 1 I/O channel
    /// ref: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createScriptProcessor
    let processor = ctx.createScriptProcessor(0, 1, 1)
    processor.onaudioprocess = e => {
      if (this.mainbus.state === 'recording') {
        this._processData(e)
      }
    }

    // connect processing pipeline
    /// ref: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamSource
    analyser.connect(processor)
    processor.connect(ctx.destination)

    return analyser
  }

  pipe (stream) {
    // connect stream pipeline
    /// ref: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamSource
    let src = this.context.createMediaStreamSource(stream)
    src.connect(this.analyser)
    this.analyser.connect(this.processor)
    this.processor.connect(this.context.destination)
  }

  cutoff () {
  }

  _processData (e) {
    // half of the fftSize
    let data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(data)
    let value = this._calcAvgVolume(data)
    this.mainbus.emit('wave', {
      value: value
    })
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

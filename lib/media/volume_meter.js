/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

import AudioFilter from './audio_filter'

class VolumeMeter extends AudioFilter {
  constructor (mainbus) {
    super()
    this.mainbus = mainbus
    this.analyser = null
    this.processor = null
    this.init(this.context)
  }

  init (ctx) {
    // use 2048 bytes for fft and 0 smoothing
    /// ref: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 2048
    this.analyser.smoothingTimeConstant = 0

    // use auto buffer size and only 1 I/O channel
    /// ref: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createScriptProcessor
    this.processor = ctx.createScriptProcessor(0, 1, 1)
    this.processor.onaudioprocess = e => this._processData(e)
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
    let data = new Uint8Array(this.analyser.frequencyBinCount) // 1024 bytes
    this.analyser.getByteFrequencyData(data)
    let volume = this._calcAvgVolume(data)
    console.log(volume)
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

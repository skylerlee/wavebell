/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

// AudioContext singleton shared by filters
let audioContext = null

class AudioFilter {

  /**
   * Get AudioContext instance
   * @returns {AudioContext} - Shared instance
   */
  getContext () {
    if (!audioContext) {
      audioContext = new AudioContext()
    }
    return audioContext
  }
}

export default AudioFilter

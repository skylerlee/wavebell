/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

import props from '@/util/props'

/**
 * Shim for MediaDevices#getUserMedia method.
 * @param {object} constraints - The user media constraints.
 */
function getUserMedia (constraints) {
  let win = window
  if (props('navigator.mediaDevices.getUserMedia').hadBy(win)) {
    let medias = props('navigator.mediaDevices').from(win)
    return medias.getUserMedia(constraints)
  }
  let userMediaGetter = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia
  if (!userMediaGetter) {
    throw new Error('getUserMedia is not supported by this browser')
  }
  return new Promise((resolve, reject) => {
    userMediaGetter(constraints, resolve, reject)
  })
}

/**
 * Access audio input from microphone device.
 */
function getUserMicrophone () {
  return getUserMedia({ audio: true, video: false })
}

export {
  getUserMedia,
  getUserMicrophone
}

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

import props from '../util/props'

function getUserMedia (constraints) {
  let win = window
  if (props('navigator.mediaDevices.getUserMedia').hadBy(win)) {
    let medias = props('navigator.mediaDevices').from(win)
    return medias.getUserMedia(constraints)
  }
  let userMediaGetter = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia
  return new Promise((resolve, reject) => {
    userMediaGetter(constraints, resolve, reject)
  })
}

function getUserMicrophone () {
  return getUserMedia({ audio: true, video: false })
}

export {
  getUserMedia,
  getUserMicrophone
}

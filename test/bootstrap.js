/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

function register (runner) {
  // establish connection
  let socket = new WebSocket('ws://localhost:9020')

  runner.on('end', () => {
    console.log(runner)
  })
}

exports.register = register

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

// Add auto object serialization
let origSend = WebSocket.prototype.send

WebSocket.prototype.send = function (msg) {
  if (typeof msg === 'object') {
    msg = JSON.stringify(msg)
  }
  origSend.call(this, msg)
}

function register (mocha) {
  // establish connection
  let socket = new WebSocket('ws://localhost:9020')
  socket.addEventListener('open', () => {
    // start runner
    let runner = mocha.run()
    runner.on('end', () => {
      socket.send({
        type: 'done',
        failures: runner.failures
      })
    })
  })
}

exports.register = register

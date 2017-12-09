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

function redirect (socket) {
  console.log = function () {
    let msg = Array.prototype.slice.call(arguments, 0)
    socket.send({
      type: 'log',
      data: msg
    })
  }
}

function register (mocha) {
  // establish connection
  let socket = new WebSocket('ws://localhost:9020')
  socket.addEventListener('open', () => {
    if (process.env.NODE_ENV === 'testing') {
      redirect(socket)
      // use spec reporter
      mocha.setup({
        reporter: 'spec'
      })
    }
    // start runner
    let runner = mocha.run()
    runner.on('end', () => {
      socket.send({
        type: 'done',
        failures: runner.failures,
        coverage: window.__coverage__
      })
    })
  })
}

exports.register = register

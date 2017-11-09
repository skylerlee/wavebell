#!/usr/bin/env node
'use strict'

const ws = require('ws')
const launcher = require('chrome-launcher')

let server = new ws.Server({
  port: 9020
})
let handler = {
  init (socket) {
    console.log('Test runner start')
    socket.on('message', msg => {
      (this[msg.type] || this.noop).call(this, msg)
    })
  },
  passed (msg) {
    console.log('Test passed')
  },
  failed (msg) {
    console.log('Test failed')
  },
  noop () {}
}

server.on('connection', socket => handler.init(socket))

launcher.launch({
  chromeFlags: ['--allow-file-access-from-files'],
  startingUrl: `file://${__dirname}/index.html`
})

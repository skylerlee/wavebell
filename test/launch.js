#!/usr/bin/env node
'use strict'

const ws = require('ws')
const launcher = require('chrome-launcher')

let server = new ws.Server({
  port: 9020
})
let browser = null

let handler = {
  init (socket) {
    console.log('Test runner started')
    socket.on('close', () => this.destroy())
    socket.on('message', data => {
      let msg = JSON.parse(data)
      let slot = this[msg.type] || this.noop
      slot.call(this, msg)
    })
  },
  destroy () {
    console.log('Test runner terminated')
    server.close()
  },
  passed (msg) {
    console.log('Test passed')
    this.done()
  },
  failed (msg) {
    console.log('Test failed')
    this.done()
  },
  done () {
    browser.kill()
  },
  noop () {}
}

server.on('connection', socket => handler.init(socket))

launcher.launch({
  chromeFlags: ['--allow-file-access-from-files'],
  startingUrl: `file://${__dirname}/index.html`
}).then(chrome => {
  browser = chrome
})

#!/usr/bin/env node
'use strict'

const ws = require('ws')
const launcher = require('chrome-launcher')

// chrome launcher options
let chromeOpts = {
  chromeFlags: ['--allow-file-access-from-files'],
  startingUrl: `file://${__dirname}/index.html`
}

let server = new ws.Server({
  port: 9020
})

let browser = {
  inst: null,
  get silent () {
    return process.env.NODE_ENV === 'testing'
  },
  open () {
    launcher.launch(chromeOpts).then(chrome => {
      // promise not resolve in headless mode
      this.inst = chrome
    })
  },
  close () {
    if (this.silent) {
      this.inst.kill()
    }
    this.inst = null
  }
}

// browser message handler
let handler = {
  init (socket) {
    socket.on('close', () => this.destroy())
    socket.on('message', data => {
      let msg = JSON.parse(data)
      let slot = this[msg.type] || this.noop
      slot.call(this, msg)
    })
  },
  destroy () {
    server.close()
  },
  done (msg) {
    if (msg.failures > 0) {
      process.exitCode = 1
    }
    browser.close()
  },
  noop () {}
}

server.on('connection', socket => handler.init(socket))
server.on('listening', () => browser.open())

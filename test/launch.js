#!/usr/bin/env node
'use strict'

const ws = require('ws')
const launcher = require('chrome-launcher')

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
    if (this.silent) {
      chromeOpts.chromeFlags = chromeOpts.chromeFlags || []
      chromeOpts.chromeFlags.push('--headless')
    }
    launcher.launch(chromeOpts).then(chrome => this.inst = chrome)
  },
  close () {
    if (this.silent) {
      this.inst.kill()
    }
    this.inst = null
  }
}

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
    process.exitCode = 0
    this.done()
  },
  failed (msg) {
    console.log('Test failed')
    process.exitCode = 1
    this.done()
  },
  done () {
    browser.close()
  },
  noop () {}
}

server.on('connection', socket => handler.init(socket))
server.on('listening', () => browser.open())

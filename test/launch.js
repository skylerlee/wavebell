#!/usr/bin/env node
'use strict'

const ws = require('ws')
const fs = require('fs-extra')
const path = require('path')
const launcher = require('chrome-launcher')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const NYC_OUTPUT = path.join(PROJECT_ROOT, '.nyc_output')

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
    let delay = 1000
    setTimeout(() => {
      // close server if not reconnected
      if (server.clients.size === 0) {
        server.close()
      }
    }, delay)
  },
  done (msg) {
    if (msg.coverage) {
      let covFile = path.join(NYC_OUTPUT, 'coverage.json')
      fs.writeJson(covFile, msg.coverage)
    }
    if (msg.failures > 0) {
      process.exitCode = 1
    }
    browser.close()
  },
  noop () {}
}

server.on('connection', socket => handler.init(socket))
server.on('listening', () => browser.open())

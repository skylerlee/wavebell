#!/usr/bin/env node
'use strict'

const ws = require('ws')
const fs = require('fs-extra')
const path = require('path')
const launcher = require('chrome-launcher')

const TESTING_MODE = process.env.NODE_ENV === 'testing'
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
  open () {
    launcher.launch(chromeOpts).then(chrome => {
      // promise not resolve in headless mode
      this.inst = chrome
    })
  },
  close () {
    if (TESTING_MODE) {
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
  log (msg) {
    console.log.apply(console, msg.data)
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
  report (output) {
    fs.ensureDir(NYC_OUTPUT).then(() => {
      let covFile = path.join(NYC_OUTPUT, 'coverage.json')
      fs.writeJson(covFile, output)
    })
  },
  done (msg) {
    if (msg.coverage) {
      this.report(msg.coverage)
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

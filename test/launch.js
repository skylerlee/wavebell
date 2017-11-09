#!/usr/bin/env node
'use strict'

const ws = require('ws')
const launcher = require('chrome-launcher')

let server = new ws.Server({
  port: 9020
})

launcher.launch({
  chromeFlags: ['--allow-file-access-from-files'],
  startingUrl: `file://${__dirname}/index.html`
})

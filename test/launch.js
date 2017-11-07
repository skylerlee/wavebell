#!/usr/bin/env node
'use strict'

const launcher = require('chrome-launcher')

launcher.launch({
  chromeFlags: ['--allow-file-access-from-files'],
  startingUrl: `file://${__dirname}/index.html`
})

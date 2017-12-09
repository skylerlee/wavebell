# wavebell

[![Build Status](https://travis-ci.org/skylerlee/wavebell.svg?branch=master)](https://travis-ci.org/skylerlee/wavebell)
[![Coverage Status](https://coveralls.io/repos/github/skylerlee/wavebell/badge.svg?branch=master)](https://coveralls.io/github/skylerlee/wavebell)
[![npm](https://img.shields.io/npm/v/wavebell.svg)](https://www.npmjs.com/package/wavebell)

Catch realtime audio wave from microphone with JavaScript!

## Screenshot
![wavebell](https://user-images.githubusercontent.com/6789491/33554578-3d9067de-d938-11e7-8946-4dd6870d4495.gif)

## Installation

```bash
# Install with npm
npm install --save wavebell
# Install with yarn
yarn add wavebell
```

## Example

```javascript
var bell = new WaveBell();

bell.on('wave', function (e) {
  // draw oscilloscope
  drawColumn(e.value);
});

bell.on('stop', function () {
  var blob = bell.result;
  // play recorded audio
  playback(URL.createObjectURL(blob));
});

// 25 frames per second
bell.start(1000 / 25);
```

## Notice
In Chrome 47 or above, `getUserMedia` requires HTTPS to work.
So it'd be better to setup SSL for your server.

## Thanks
* **Mozilla web docs** [visualizations with web audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
* **Jos Dirksen** for his [great blog post about audio visualization](http://www.smartjava.org/content/exploring-html5-web-audio-visualizing-sound)

## License
The MIT License.

# wavebell

[![Build Status](https://travis-ci.org/skylerlee/wavebell.svg?branch=master)](https://travis-ci.org/skylerlee/wavebell)

A web audio recorder with visual waveform.

## Installation

```bash
npm install --save wavebell
```

## Example

```javascript
var bell = new WaveBell();

bell.on('wave', function (e) {
  drawColumn(e.value);
});

bell.on('stop', function () {
  var blob = bell.result;
  playback(URL.createObjectURL(blob));
});
```

## Thanks
* **Jos Dirksen** for his [great blog post](http://www.smartjava.org/content/exploring-html5-web-audio-visualizing-sound)

## License
The MIT License.

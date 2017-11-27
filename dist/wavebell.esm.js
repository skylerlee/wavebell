/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

function slice (args, from) {
  return Array.prototype.slice.call(args, from)
}

class Emitter {
  constructor () {
    this.handlerMap = {};
  }

  on (event, handler) {
    if (typeof event !== 'string') {
      throw new TypeError(event + ' is not a string')
    }
    if (typeof handler !== 'function') {
      throw new TypeError(handler + ' is not a function')
    }
    let map = this.handlerMap;
    let handlers = map[event] = map[event] || [];
    let i = handlers.indexOf(handler);
    if (i === -1) {
      handlers.push(handler);
    }
    return this
  }

  off (event, handler) {
    if (handler === undefined) {
      // remove all handlers
      delete this.handlerMap[event];
      return this
    }
    // remove registered handler
    let handlers = this.handlerMap[event];
    if (handlers) {
      let i = handlers.indexOf(handler);
      if (i >= 0) {
        handlers.splice(i, 1);
      }
      // cleanup empty handlers
      if (handlers.length === 0) {
        this.off(event);
      }
    }
    return this
  }

  emit (event) {
    let args = slice(arguments, 1);
    let handlers = this.handlerMap[event];
    if (handlers) {
      for (let i = 0, len = handlers.length; i < len; i++) {
        handlers[i].apply(undefined, args);
      }
    }
    return this
  }
}

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

class Assertion {
  constructor (value) {
    this.value = value;
    this._negative = false;
    this._error = new Error('Assertion failed');
  }

  get to () {
    return this
  }

  get not () {
    this._negative = !this._negative;
    return this
  }

  that (error) {
    this._error = error;
    return this
  }

  equal (value) {
    if ((value === this.value) === this._negative) {
      throw this._error
    }
  }
}

function assert (value) {
  return new Assertion(value)
}

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

const AudioContext = window.AudioContext || window.webkitAudioContext;

// AudioContext singleton shared by filters
let audioContext = null;

class AudioFilter {
  /**
   * Get AudioContext instance
   * @returns {AudioContext} - Shared instance
   */
  get context () {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext
  }
}

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

class VolumeMeter extends AudioFilter {
  constructor (mainbus, options) {
    super();
    this.mainbus = mainbus;
    this.options = Object.assign({
      minLimit: 0,
      maxLimit: 128,
      fftSize: 1024,
      smoothing: 0.3
    }, options);
    this._checkOptions(this.options);
    this.source = null;
    this.analyser = this._initAnalyser(this.options);
  }

  _checkOptions (options) {
    if (options.maxLimit <= options.minLimit) {
      throw new RangeError('Wrong limit range for volume')
    }
  }

  _initAnalyser (options) {
    // init analyser from options
    /// ref: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
    let analyser = this.context.createAnalyser();
    analyser.fftSize = options.fftSize;
    analyser.smoothingTimeConstant = options.smoothing;
    // process data when available
    this.mainbus.on('dataavailable', e => this._processData());
    return analyser
  }

  pipe (stream) {
    // connect stream pipe
    this.source = this.context.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
    this.analyser.connect(this.context.destination);
  }

  cutoff () {
    this.analyser.disconnect(this.context.destination);
    this.source.disconnect(this.analyser);
    this.source = null;
  }

  _processData () {
    // half of the fftSize
    let data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    let volume = this._calcAvgVolume(data);
    this.mainbus.emit('wave', {
      value: this._alignVolume(volume)
    });
  }

  _alignVolume (volume) {
    let opts = this.options;
    if (volume < opts.minLimit) {
      volume = opts.minLimit;
    }
    if (volume > opts.maxLimit) {
      volume = opts.maxLimit;
    }
    return (volume - opts.minLimit) / (opts.maxLimit - opts.minLimit)
  }

  _calcAvgVolume (data) {
    let sum = 0;
    let len = data.length;
    for (let i = 0; i < len; i++) {
      sum += data[i];
    }
    return sum / len
  }
}

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

const hasOwn = Object.prototype.hasOwnProperty;

class PropPath {
  constructor (path) {
    this.steps = path.split('.');
    this.fallback = undefined;
  }

  travel (target, fn) {
    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not a function')
    }
    let len = this.steps.length;
    let i = 0;
    let step = this.steps[i];
    while (fn(target, step) && i < len) {
      target = target[step];
      step = this.steps[++i];
    }
    return {
      step: i,
      value: target
    }
  }

  or (defaultValue) {
    this.fallback = defaultValue;
    return this
  }

  from (obj) {
    let ret = this.travel(obj, (target, step) => {
      return target != null && step in Object(target)
    });
    if (ret.step === this.steps.length) {
      return ret.value
    } else {
      return this.fallback
    }
  }

  hadBy (obj) {
    let ret = this.travel(obj, (target, step) => {
      return target != null && step in Object(target)
    });
    return ret.step === this.steps.length
  }

  ownedBy (obj) {
    let ret = this.travel(obj, (target, step) => {
      return target != null && hasOwn.call(target, step)
    });
    return ret.step === this.steps.length
  }
}

function props (path) {
  if (typeof path !== 'string') {
    throw new TypeError(path + ' is not a string')
  }
  return new PropPath(path)
}

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

/**
 * Shim for MediaDevices#getUserMedia method
 * @param {object} constraints - The user media constraints
 */
function getUserMedia (constraints) {
  if (props('navigator.mediaDevices.getUserMedia').hadBy(window)) {
    let medias = props('navigator.mediaDevices').from(window);
    return medias.getUserMedia(constraints)
  }
  let userMediaGetter = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia;
  if (!userMediaGetter) {
    throw new Error('getUserMedia is not supported by this browser')
  }
  return new Promise((resolve, reject) => {
    userMediaGetter(constraints, resolve, reject);
  })
}

/**
 * Access audio input from microphone device
 */
function getUserMicrophone () {
  return getUserMedia({ audio: true, video: false })
}

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

function buildError (callee, that) {
  return new Error(`Failed to execute '${callee}' on 'Recorder'` +
    (that ? `:\nThe Recorder's state is '${that.state}'.` : ''))
}

class Recorder extends Emitter {
  constructor (options) {
    super();
    this.options = Object.assign({
      mimeType: 'audio/webm',
      audioBitsPerSecond: 96000
    }, options);
    this._intern = null;
    this._result = null;
    this._filter = new VolumeMeter(this, this.options.meter);
  }

  get state () {
    if (this._intern === null) {
      return 'inactive'
    } else {
      return this._intern.state
    }
  }

  get ready () {
    return this._intern !== null
  }

  get result () {
    if (!this._result) {
      return null
    }
    return new Blob(this._result, {
      type: this.options.mimeType
    })
  }

  open () {
    assert(this.ready).that(buildError('open')).to.equal(false);
    return getUserMicrophone().then(stream => {
      // create internal recorder
      this._intern = new MediaRecorder(stream, this.options);
      // register event listeners
      let eventTypes = ['error', 'pause', 'resume', 'start', 'stop'];
      eventTypes.map(type => {
        this._intern.addEventListener(type, e => this.emit(type, e));
      });
      this._intern.addEventListener('dataavailable', e => {
        this._result.push(e.data);
        this.emit('dataavailable', e);
      });
      // pipe stream to filter
      this._filter.pipe(stream);
    })
  }

  close () {
    assert(this.ready).that(buildError('close')).to.equal(true);
    // close all stream tracks
    let tracks = this._intern.stream.getTracks();
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].stop();
    }
    // close stream filter
    this._filter.cutoff();
    this._intern = null;
  }

  start (timeslice) {
    assert(this.state).that(buildError('start', this)).to.equal('inactive');
    // init result data on every start
    this._result = [];
    // use lazy open policy
    if (!this.ready) {
      this.open().then(() => {
        this._intern.start(timeslice);
      });
    } else {
      this._intern.start(timeslice);
    }
  }

  stop () {
    assert(this.state).that(buildError('stop', this)).to.not.equal('inactive');
    this._intern.stop();
  }

  pause () {
    assert(this.state).that(buildError('pause', this)).to.equal('recording');
    this._intern.pause();
  }

  resume () {
    assert(this.state).that(buildError('resume', this)).to.equal('paused');
    this._intern.resume();
  }
}

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

class WaveBell extends Recorder {}

export default WaveBell;
//# sourceMappingURL=wavebell.esm.js.map

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.WaveBell = factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

function slice(args, from) {
  return Array.prototype.slice.call(args, from);
}

var Emitter = function () {
  function Emitter() {
    classCallCheck(this, Emitter);

    this.handlerMap = {};
  }

  createClass(Emitter, [{
    key: 'on',
    value: function on(event, handler) {
      if (typeof event !== 'string') {
        throw new TypeError(event + ' is not a string');
      }
      if (typeof handler !== 'function') {
        throw new TypeError(handler + ' is not a function');
      }
      var map = this.handlerMap;
      var handlers = map[event] = map[event] || [];
      var i = handlers.indexOf(handler);
      if (i === -1) {
        handlers.push(handler);
      }
      return this;
    }
  }, {
    key: 'off',
    value: function off(event, handler) {
      if (handler === undefined) {
        // remove all handlers
        delete this.handlerMap[event];
        return this;
      }
      // remove registered handler
      var handlers = this.handlerMap[event];
      if (handlers) {
        var i = handlers.indexOf(handler);
        if (i >= 0) {
          handlers.splice(i, 1);
        }
        // cleanup empty handlers
        if (handlers.length === 0) {
          this.off(event);
        }
      }
      return this;
    }
  }, {
    key: 'emit',
    value: function emit(event) {
      var args = slice(arguments, 1);
      var handlers = this.handlerMap[event];
      if (handlers) {
        for (var i = 0, len = handlers.length; i < len; i++) {
          handlers[i].apply(undefined, args);
        }
      }
      return this;
    }
  }]);
  return Emitter;
}();

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

var Assertion = function () {
  function Assertion(value) {
    classCallCheck(this, Assertion);

    this.value = value;
    this._negative = false;
    this._error = new Error('Assertion failed');
  }

  createClass(Assertion, [{
    key: 'that',
    value: function that(error) {
      this._error = error;
      return this;
    }
  }, {
    key: 'equal',
    value: function equal(value) {
      if (value === this.value === this._negative) {
        throw this._error;
      }
    }
  }, {
    key: 'to',
    get: function get$$1() {
      return this;
    }
  }, {
    key: 'not',
    get: function get$$1() {
      this._negative = !this._negative;
      return this;
    }
  }]);
  return Assertion;
}();

function assert(value) {
  return new Assertion(value);
}

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

var AudioContext = window.AudioContext || window.webkitAudioContext;

// AudioContext singleton shared by filters
var audioContext = null;

var AudioFilter = function () {
  function AudioFilter() {
    classCallCheck(this, AudioFilter);
  }

  createClass(AudioFilter, [{
    key: "context",

    /**
     * Get AudioContext instance
     * @returns {AudioContext} - Shared instance
     */
    get: function get$$1() {
      if (!audioContext) {
        audioContext = new AudioContext();
      }
      return audioContext;
    }
  }]);
  return AudioFilter;
}();

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

var VolumeMeter = function (_AudioFilter) {
  inherits(VolumeMeter, _AudioFilter);

  function VolumeMeter(mainbus, options) {
    classCallCheck(this, VolumeMeter);

    var _this = possibleConstructorReturn(this, (VolumeMeter.__proto__ || Object.getPrototypeOf(VolumeMeter)).call(this));

    _this.mainbus = mainbus;
    _this.options = Object.assign({
      minLimit: 0,
      maxLimit: 128,
      fftSize: 1024,
      smoothing: 0.3
    }, options);
    _this._checkOptions(_this.options);
    _this._cache = null;
    _this.source = null;
    _this.analyser = _this._initAnalyser(_this.options);
    return _this;
  }

  createClass(VolumeMeter, [{
    key: '_checkOptions',
    value: function _checkOptions(options) {
      if (options.maxLimit <= options.minLimit) {
        throw new RangeError('Wrong limit range for volume');
      }
    }
  }, {
    key: '_initAnalyser',
    value: function _initAnalyser(options) {
      var _this2 = this;

      // init analyser from options
      /// ref: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
      var analyser = this.context.createAnalyser();
      analyser.fftSize = options.fftSize;
      analyser.smoothingTimeConstant = options.smoothing;
      // process data when available
      this.mainbus.on('dataavailable', function (e) {
        return _this2._processData();
      });
      return analyser;
    }
  }, {
    key: 'pipe',
    value: function pipe(stream) {
      // connect stream pipe
      this.source = this.context.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
    }
  }, {
    key: 'cutoff',
    value: function cutoff() {
      this.source.disconnect(this.analyser);
      this.source = null;
    }
  }, {
    key: '_processData',
    value: function _processData() {
      // half of the fftSize
      if (!this._cache) {
        this._cache = new Uint8Array(this.analyser.frequencyBinCount);
      }
      this.analyser.getByteFrequencyData(this._cache);
      var volume = this._calcAvgVolume(this._cache);
      this.mainbus.emit('wave', {
        value: this._alignVolume(volume)
      });
    }
  }, {
    key: '_alignVolume',
    value: function _alignVolume(volume) {
      var opts = this.options;
      if (volume < opts.minLimit) {
        volume = opts.minLimit;
      }
      if (volume > opts.maxLimit) {
        volume = opts.maxLimit;
      }
      return (volume - opts.minLimit) / (opts.maxLimit - opts.minLimit);
    }
  }, {
    key: '_calcAvgVolume',
    value: function _calcAvgVolume(data) {
      var sum = 0;
      var len = data.length;
      for (var i = 0; i < len; i++) {
        sum += data[i];
      }
      return sum / len;
    }
  }]);
  return VolumeMeter;
}(AudioFilter);

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

var hasOwn = Object.prototype.hasOwnProperty;

var PropPath = function () {
  function PropPath(path) {
    classCallCheck(this, PropPath);

    this.steps = path.split('.');
    this.fallback = undefined;
  }

  createClass(PropPath, [{
    key: 'travel',
    value: function travel(target, fn) {
      if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not a function');
      }
      var len = this.steps.length;
      var i = 0;
      var step = this.steps[i];
      while (fn(target, step) && i < len) {
        target = target[step];
        step = this.steps[++i];
      }
      return {
        step: i,
        value: target
      };
    }
  }, {
    key: 'or',
    value: function or(defaultValue) {
      this.fallback = defaultValue;
      return this;
    }
  }, {
    key: 'from',
    value: function from(obj) {
      var ret = this.travel(obj, function (target, step) {
        return target != null && step in Object(target);
      });
      if (ret.step === this.steps.length) {
        return ret.value;
      } else {
        return this.fallback;
      }
    }
  }, {
    key: 'hadBy',
    value: function hadBy(obj) {
      var ret = this.travel(obj, function (target, step) {
        return target != null && step in Object(target);
      });
      return ret.step === this.steps.length;
    }
  }, {
    key: 'ownedBy',
    value: function ownedBy(obj) {
      var ret = this.travel(obj, function (target, step) {
        return target != null && hasOwn.call(target, step);
      });
      return ret.step === this.steps.length;
    }
  }]);
  return PropPath;
}();

function props(path) {
  if (typeof path !== 'string') {
    throw new TypeError(path + ' is not a string');
  }
  return new PropPath(path);
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
function getUserMedia(constraints) {
  if (props('navigator.mediaDevices.getUserMedia').hadBy(window)) {
    var medias = props('navigator.mediaDevices').from(window);
    return medias.getUserMedia(constraints);
  }
  var userMediaGetter = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  if (!userMediaGetter) {
    throw new Error('getUserMedia is not supported by this browser');
  }
  return new Promise(function (resolve, reject) {
    userMediaGetter(constraints, resolve, reject);
  });
}

/**
 * Access audio input from microphone device
 */
function getUserMicrophone() {
  return getUserMedia({ audio: true, video: false });
}

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

function buildError(callee, that) {
  return new Error('Failed to execute \'' + callee + '\' on \'Recorder\'' + (that ? ':\nThe Recorder\'s state is \'' + that.state + '\'.' : ''));
}

var Recorder = function (_Emitter) {
  inherits(Recorder, _Emitter);

  function Recorder(options) {
    classCallCheck(this, Recorder);

    var _this = possibleConstructorReturn(this, (Recorder.__proto__ || Object.getPrototypeOf(Recorder)).call(this));

    _this.options = Object.assign({
      mimeType: 'audio/webm',
      audioBitsPerSecond: 96000
    }, options);
    _this._intern = null;
    _this._result = null;
    _this._filter = new VolumeMeter(_this, _this.options.meter);
    return _this;
  }

  createClass(Recorder, [{
    key: 'open',
    value: function open() {
      var _this2 = this;

      assert(this.ready).that(buildError('open')).to.equal(false);
      return getUserMicrophone().then(function (stream) {
        // create internal recorder
        _this2._intern = new MediaRecorder(stream, _this2.options);
        // register event listeners
        var eventTypes = ['error', 'pause', 'resume', 'start', 'stop'];
        eventTypes.map(function (type) {
          _this2._intern.addEventListener(type, function (e) {
            return _this2.emit(type, e);
          });
        });
        _this2._intern.addEventListener('dataavailable', function (e) {
          _this2._result.push(e.data);
          _this2.emit('dataavailable', e);
        });
        // pipe stream to filter
        _this2._filter.pipe(stream);
      });
    }
  }, {
    key: 'close',
    value: function close() {
      assert(this.ready).that(buildError('close')).to.equal(true);
      // close all stream tracks
      var tracks = this._intern.stream.getTracks();
      for (var i = 0; i < tracks.length; i++) {
        tracks[i].stop();
      }
      // close stream filter
      this._filter.cutoff();
      this._intern = null;
    }
  }, {
    key: 'start',
    value: function start(timeslice) {
      var _this3 = this;

      assert(this.state).that(buildError('start', this)).to.equal('inactive');
      // init result data on every start
      this._result = [];
      // use lazy open policy
      if (!this.ready) {
        this.open().then(function () {
          _this3._intern.start(timeslice);
        });
      } else {
        this._intern.start(timeslice);
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      assert(this.state).that(buildError('stop', this)).to.not.equal('inactive');
      this._intern.stop();
    }
  }, {
    key: 'pause',
    value: function pause() {
      assert(this.state).that(buildError('pause', this)).to.equal('recording');
      this._intern.pause();
    }
  }, {
    key: 'resume',
    value: function resume() {
      assert(this.state).that(buildError('resume', this)).to.equal('paused');
      this._intern.resume();
    }
  }, {
    key: 'state',
    get: function get$$1() {
      if (this._intern === null) {
        return 'inactive';
      } else {
        return this._intern.state;
      }
    }
  }, {
    key: 'ready',
    get: function get$$1() {
      return this._intern !== null;
    }
  }, {
    key: 'result',
    get: function get$$1() {
      if (!this._result) {
        return null;
      }
      return new Blob(this._result, {
        type: this.options.mimeType
      });
    }
  }]);
  return Recorder;
}(Emitter);

/*
 * Copyright (C) 2017, Skyler.
 * Use of this source code is governed by the MIT license that can be
 * found in the LICENSE file.
 */

var WaveBell = function (_Recorder) {
  inherits(WaveBell, _Recorder);

  function WaveBell() {
    classCallCheck(this, WaveBell);
    return possibleConstructorReturn(this, (WaveBell.__proto__ || Object.getPrototypeOf(WaveBell)).apply(this, arguments));
  }

  return WaveBell;
}(Recorder);

return WaveBell;

})));
//# sourceMappingURL=wavebell.js.map

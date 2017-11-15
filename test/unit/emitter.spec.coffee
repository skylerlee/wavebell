import Emitter from '@/util/emitter'

describe 'util/emitter', ->
  describe '#on', ->
    it 'should only accept a string as first argument', ->
      e = new Emitter()
      expect(-> e.on('foo', ->)).not.to.throw()
      expect(-> e.on(12, ->)).to.throw(TypeError)
      expect(-> e.on(null, ->)).to.throw(TypeError)
      expect(-> e.on(undefined, ->)).to.throw(TypeError)
      expect(-> e.on({}, ->)).to.throw(TypeError)

    it 'should only accept a function as second argument', ->
      e = new Emitter()
      expect(-> e.on('foo', ->)).not.to.throw()
      expect(-> e.on('foo')).to.throw(TypeError)
      expect(-> e.on('foo', null)).to.throw(TypeError)
      expect(-> e.on('foo', 10)).to.throw(TypeError)
      expect(-> e.on('foo', 'callback')).to.throw(TypeError)

    it 'should create a handler array when event not registered', ->
      e = new Emitter()
      expect(Object.keys(e.handlerMap).length).to.equal(0)
      e.on('foo', ->)
      expect(Object.keys(e.handlerMap).length).to.equal(1)
      expect(e.handlerMap['foo'] instanceof Array).to.be.true
      e.on('bar', ->)
      expect(Object.keys(e.handlerMap).length).to.equal(2)
      expect(e.handlerMap['bar'] instanceof Array).to.be.true

    it 'should append an event handler otherwise', ->
      e = new Emitter()
      expect(Object.keys(e.handlerMap).length).to.equal(0)
      e.on('foo', callback1 = ->)
      e.on('foo', callback2 = ->)
      expect(Object.keys(e.handlerMap).length).to.equal(1)
      expect(e.handlerMap['foo'].length).to.equal(2)
      expect(e.handlerMap['foo'][0]).to.equal(callback1)
      expect(e.handlerMap['foo'][1]).to.equal(callback2)

  describe '#off', ->
    it 'should remove an event handler if it is found', ->
      e = new Emitter()
      e.on('foo', callback1 = ->)
      e.on('foo', callback2 = ->)
      e.on('foo', callback3 = ->)
      expect(Object.keys(e.handlerMap).length).to.equal(1)
      expect(e.handlerMap['foo'].length).to.equal(3)
      e.off('foo', callback2)
      expect(Object.keys(e.handlerMap).length).to.equal(1)
      expect(e.handlerMap['foo'].length).to.equal(2)
      expect(e.handlerMap['foo'][0]).to.equal(callback1)
      expect(e.handlerMap['foo'][1]).to.equal(callback3)

    it 'should remove all handlers if called with only one argument', ->
      e = new Emitter()
      e.on('foo', ->)
      e.on('foo', ->)
      expect(Object.keys(e.handlerMap).length).to.equal(1)
      e.off('foo')
      expect(Object.keys(e.handlerMap).length).to.equal(0)

    it 'should ignore removing handler of unregistered event', ->
      e = new Emitter()
      e.on('foo', callback1 = ->)
      e.on('foo', callback2 = ->)
      expect(e.handlerMap['foo'].length).to.equal(2)
      e.off('bar', callback1)
      expect(e.handlerMap['foo'].length).to.equal(2)
      e.off('bar')
      expect(e.handlerMap['foo'].length).to.equal(2)

    it 'should ignore removing handler if it is not found', ->
      e = new Emitter()
      e.on('foo', callback1 = ->)
      e.on('foo', callback2 = ->)
      expect(e.handlerMap['foo'].length).to.equal(2)
      e.off('foo', callback3 = ->)
      expect(e.handlerMap['foo'].length).to.equal(2)

    it 'should remove the handler array if it is empty', ->
      e = new Emitter()
      e.on('foo', callback1 = ->)
      e.on('foo', callback2 = ->)
      e.on('bar', ->)
      e.on('bar', ->)
      expect(Object.keys(e.handlerMap).length).to.equal(2)
      e.off('foo', callback1)
      e.off('foo', callback2)
      expect(Object.keys(e.handlerMap).length).to.equal(1)
      e.off('bar')
      expect(Object.keys(e.handlerMap).length).to.equal(0)

  describe '#emit', ->
    it 'should meet basic functions', ->
      called = false
      e = new Emitter()
      e.on('foo', -> called = true)
      e.emit('foo')
      expect(called).to.be.true

    it 'should support methods chaining', ->
      num = 0
      e = new Emitter()
      e.on('foo', -> num++).on('bar', -> num++).emit('foo').emit('bar')
      expect(num).to.equal(2)

    it 'should ignore emitting unregistered event', ->
      called = false
      e = new Emitter()
      e.on('foo', -> called = true)
      e.emit('bar')
      expect(called).to.be.false

    it 'should pass correct arguments to handlers', ->
      e = new Emitter()
      e.on 'foo', (a) ->
        expect(a).to.equal('foo data')
      data = {
        qux: 'qux data'
      }
      e.on 'bar', (a, b, c, d) ->
        expect(a).to.equal(1)
        expect(b).to.equal('bar data')
        expect(c).to.equal(true)
        expect(d).to.equal(data)
      e.on 'baz', (a) ->
        expect(a).to.be.undefined
      e.emit('foo', 'foo data')
      e.emit('bar', 1, 'bar data', true, data)
      e.emit('baz')

    it 'should call event handler at correct times', ->
      counter = {
        num: 0,
        acc: -> @num++,
        reset: -> @num = 0
      }
      e = new Emitter()
      e.on('foo', callback1 = -> counter.acc())
      e.on('foo', callback2 = -> counter.acc())
      e.emit('foo')
      expect(counter.num).to.equal(2)
      counter.reset()
      e.on('bar', -> counter.acc())
      e.emit('bar')
      expect(counter.num).to.equal(1)
      counter.reset()
      e.emit('foo').emit('bar')
      expect(counter.num).to.equal(3)
      counter.reset()
      e.off('foo', callback1)
      e.off('bar')
      e.emit('foo').emit('bar')
      expect(counter.num).to.equal(1)
      counter.reset()
      e.off('foo', callback2)
      e.emit('foo').emit('bar')
      expect(counter.num).to.equal(0)
      counter.reset()

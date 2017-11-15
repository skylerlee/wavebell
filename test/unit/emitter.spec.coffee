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

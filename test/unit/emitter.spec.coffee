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


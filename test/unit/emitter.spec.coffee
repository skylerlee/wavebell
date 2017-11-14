import Emitter from '@/util/emitter'

describe 'util/emitter', ->
  describe '#on', ->
    e = new Emitter()

    it 'should only accept a function as second argument', ->
      expect(-> e.on('foo', ->)).not.to.throw()
      expect(-> e.on('foo')).to.throw(TypeError)
      expect(-> e.on('foo', null)).to.throw(TypeError)
      expect(-> e.on('foo', 10)).to.throw(TypeError)
      expect(-> e.on('foo', 'callback')).to.throw(TypeError)


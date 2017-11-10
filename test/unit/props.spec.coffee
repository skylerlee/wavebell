import props from '../../lib/util/props'

describe 'util/props', ->
  it 'should accept a string argument', ->
    expect(-> props('a')).not.to.throw()
    expect(-> props()).to.throw(TypeError)
    expect(-> props(['a'])).to.throw(TypeError)

  describe '.steps', ->
    it 'should match path argument', ->
      p = props('a.b.c')
      expect(p.steps.length).to.equal(3)
      expect(p.steps[0]).to.equal('a')
      expect(p.steps[1]).to.equal('b')
      expect(p.steps[2]).to.equal('c')
      p = props('a')
      expect(p.steps.length).to.equal(1)
      expect(p.steps[0]).to.equal('a')

  describe '.travel', ->
    it 'should accept function callback as second argument', ->
      expect(-> props('a').travel(null, (val) -> val)).not.to.throw()
      expect(-> props('a').travel(null, null)).to.throw(TypeError)

  describe '.from', ->
    obj = {
      a: {
        b: {
          c: 'value1'
        },
        d: 'value2'
      },
      e: 10
    }

    it 'should get correct value', ->
      expect(props('a.b.c').from(obj)).to.equal('value1')
      expect(props('a.d').from(obj)).to.equal('value2')
      expect(props('e').from(obj)).to.equal(10)
      expect(props('a.b').from(obj)).to.equal(obj.a.b)
      expect(props('a').from(obj)).to.equal(obj.a)

    it 'should get undefined otherwise', ->
      expect(props('a.b.d').from(obj)).to.be.undefined
      expect(props('a.d.f').from(obj)).to.be.undefined
      expect(props('e.g.h').from(obj)).to.be.undefined

    it 'should tolerate bad path', ->
      expect(props('').from(obj)).to.be.undefined
      expect(props('a.b.').from(obj)).to.be.undefined
      expect(props('.').from(obj)).to.be.undefined
      expect(props('..').from(obj)).to.be.undefined

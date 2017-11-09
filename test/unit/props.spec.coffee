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

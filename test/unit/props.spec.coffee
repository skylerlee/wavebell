import props from '../../lib/util/props'

describe 'util.props', ->
  it 'should accept a string only', ->
    expect(-> props('a')).not.to.throw()
    expect(-> props()).to.throw(TypeError)
    expect(-> props(['a'])).to.throw(TypeError)

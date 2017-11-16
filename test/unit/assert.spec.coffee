import assert from '@/util/assert'

describe 'util/assert', ->
  it 'should accept an argument as value', ->
    expect(assert('a string').value).to.equal('a string')
    expect(assert(true).value).to.equal(true)
    expect(assert(100).value).to.equal(100)

  describe '.to', ->
    it 'should continue the chaining', ->
      assertion = assert('a value')
      expect(assertion.to).to.equal(assertion)
      expect(assertion.to).to.deep.equal(assertion)

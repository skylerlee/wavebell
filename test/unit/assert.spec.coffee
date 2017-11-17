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

  describe '.equal', ->
    it 'should meet basic functions', ->
      expect(-> assert('value1').to.equal('value1')).not.to.throw()
      expect(-> assert(100).to.equal(100)).not.to.throw()
      expect(-> assert('value2').to.equal('value0')).to.throw(Error, 'Assertion failed')
      expect(-> assert([]).to.equal([])).to.throw()
      expect(-> assert({}).to.equal({})).to.throw()

  describe '.not', ->
    it 'should negate the assertion', ->
      expect(-> assert('value1').to.not.equal('value0')).not.to.throw()
      expect(-> assert(100).to.not.equal(101)).not.to.throw()
      expect(-> assert({}).to.not.equal({})).not.to.throw()
      expect(-> assert('value2').to.not.equal('value2')).to.throw()

    it 'should work multiple times in the chaining', ->
      expect(-> assert(true).not.to.equal(false)).not.to.throw()
      expect(-> assert(true).not.to.not.equal(true)).not.to.throw()
      expect(-> assert(100).not.not.not.equal(101)).not.to.throw()

  describe '.that', ->
    it 'should set the custom error to throw', ->
      expect ->
        assert(typeof 'value1').that(new TypeError('Wrong type'))
        .to.equal('number')
      .to.throw(TypeError, 'Wrong type')

      expect ->
        assert(typeof 'value1').that(new TypeError('Mismatched type'))
        .not.to.equal('string')
      .to.throw(TypeError, 'Mismatched type')

      expect ->
        assert(typeof 100).that(new TypeError('Bad type'))
        .to.equal('number')
      .not.to.throw()

import props from '@/util/props'

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
      f: [2, 4, 6, {
        g: 'value3',
        h: [1, 3, 5]
      }]
    }

    it 'should get correct value', ->
      expect(props('a.b.c').from(obj)).to.equal('value1')
      expect(props('a.d').from(obj)).to.equal('value2')
      expect(props('e').from(obj)).to.equal(10)
      expect(props('a.b').from(obj)).to.equal(obj.a.b)
      expect(props('a').from(obj)).to.equal(obj.a)

    it 'should also apply for array', ->
      expect(props('f.0').from(obj)).to.equal(2)
      expect(props('f.1').from(obj)).to.equal(4)
      expect(props('f.3.g').from(obj)).to.equal('value3')
      expect(props('f.3.h.length').from(obj)).to.equal(3)
      expect(props('f.3.h.2').from(obj)).to.equal(5)
      expect(props('f.3.h').from(obj)).to.equal(obj.f[3].h)

    it 'should get undefined otherwise', ->
      expect(props('a.b.d').from(obj)).to.be.undefined
      expect(props('a.d.f').from(obj)).to.be.undefined
      expect(props('e.g.h').from(obj)).to.be.undefined

    it 'should tolerate bad path', ->
      expect(props('').from(obj)).to.be.undefined
      expect(props('a.b.').from(obj)).to.be.undefined
      expect(props('.').from(obj)).to.be.undefined
      expect(props('..').from(obj)).to.be.undefined

  describe '.or', ->
    obj = {
      a: 'value1',
      b: undefined,
      c: {
        d: 10,
        e: undefined
        f: [2, 4, 6]
      }
    }

    it 'should set a default value for `from` method', ->
      expect(props('a').or('').from(obj)).to.equal('value1')
      expect(props('b').or('').from(obj)).to.be.undefined
      expect(props('h').or('').from(obj)).to.equal('')
      expect(props('c.d').or('').from(obj)).to.equal(10)
      expect(props('c.e').or('').from(obj)).to.be.undefined
      expect(props('c.h').or('').from(obj)).to.equal('')
      expect(props('c.f.1').or('').from(obj)).to.equal(4)
      expect(props('c.f.3').or(0).from(obj)).to.equal(0)

  plain = {
    a: {
      b: 'value1'
    },
    c: 0,
    d: null,
    e: undefined
  }

  # Basic JS OOP
  Base = () ->
    this.a = 'value1'
  Base.prototype.methodB = () ->
    return 'value2'

  # Proto inheritance
  Derived = () ->
    Base.call(this)
    this.c = 'value3'
  Derived.prototype = Object.create(Base.prototype)
  Derived.prototype.methodD = () ->
    return 'value3'

  describe '.hadBy', ->
    it 'should meet basic functions', ->
      expect(props('a.b').hadBy(plain)).to.be.true
      expect(props('a').hadBy(plain)).to.be.true
      expect(props('c').hadBy(plain)).to.be.true
      expect(props('d').hadBy(plain)).to.be.true
      expect(props('e').hadBy(plain)).to.be.true
      expect(props('h').hadBy(plain)).to.be.false
      expect(props('a.b.c').hadBy(plain)).to.be.false
      expect(props('c.f').hadBy(plain)).to.be.false
      expect(props('d.f').hadBy(plain)).to.be.false
      expect(props('e.f').hadBy(plain)).to.be.false

    it 'should check for owned or inherited properties', ->
      base = new Base()
      derived = new Derived()
      expect(props('a').hadBy(base)).to.be.true
      expect(props('methodB').hadBy(base)).to.be.true
      expect(props('a').hadBy(derived)).to.be.true
      expect(props('c').hadBy(derived)).to.be.true
      expect(props('methodB').hadBy(derived)).to.be.true
      expect(props('methodD').hadBy(derived)).to.be.true

  describe '.ownedBy', ->
    it 'should meet basic functions', ->
      expect(props('a.b').ownedBy(plain)).to.be.true
      expect(props('a').ownedBy(plain)).to.be.true
      expect(props('c').ownedBy(plain)).to.be.true
      expect(props('d').ownedBy(plain)).to.be.true
      expect(props('e').ownedBy(plain)).to.be.true
      expect(props('h').ownedBy(plain)).to.be.false
      expect(props('a.b.c').ownedBy(plain)).to.be.false
      expect(props('c.f').ownedBy(plain)).to.be.false
      expect(props('d.f').ownedBy(plain)).to.be.false
      expect(props('e.f').ownedBy(plain)).to.be.false

    it 'should check for owned properties only', ->
      base = new Base()
      derived = new Derived()
      expect(props('a').ownedBy(base)).to.be.true
      expect(props('methodB').ownedBy(base)).to.be.false
      expect(props('a').ownedBy(derived)).to.be.true
      expect(props('c').ownedBy(derived)).to.be.true
      expect(props('methodB').ownedBy(derived)).to.be.false
      expect(props('methodD').ownedBy(derived)).to.be.false

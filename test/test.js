require('chai/register-expect')

describe('test all', function () {
  describe('test arithmetic', function () {
    it('add', function () {
      expect(1 + 1).to.be.a('number')
      expect(1 + 1).to.equal(2)
    })
  })
})

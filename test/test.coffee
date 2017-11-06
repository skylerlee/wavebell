# Test entry

describe 'test all', () =>
  describe 'test arithmetic', () =>
    it 'add', () =>
      expect(1 + 1).to.be.a 'number'
      expect(1 + 1).to.equal 2

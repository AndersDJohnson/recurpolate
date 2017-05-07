var recurpolate = require('.')
var normalizeExpression = recurpolate.normalizeExpression

describe('normalizeExpression', () => {
  it('should trim', () => {
    expect(normalizeExpression(' a.b.c ')).toBe('a.b.c')
  })
  it('should convert index access', () => {
    expect(normalizeExpression('a.b[0].c')).toBe('a.b.0.c')
  })
})

test('basic', () => {
  var fixture = {
    a: 'A${b}',
    b: 'B'
  }

  var expected = {
    a: 'AB',
    b: 'B'
  }

  var actual = recurpolate(fixture)

  expect(actual).toEqual(expected)
})

test('arrays', () => {
  var fixture = {
    a: 'A${ b[0] }',
    b: [
      'B0'
    ]
  }

  var expected = {
    a: 'AB0',
    b: [ 'B0' ]
  }

  var actual = recurpolate(fixture)

  expect(actual).toEqual(expected)
})

test('deep', () => {
  var fixture = {
    a: 'this is ${b.b2}',
    b: {
      b2: 'BB${c}'
    },
    c: 'C'
  }

  var expected = {
    a: 'this is BBC',
    b: {
      b2: 'BBC'
    },
    c: 'C'
  }

  var actual = recurpolate(fixture)

  expect(actual).toEqual(expected)
})

test('deep 2', () => {
  var fixture = {
    a: {
      a1: 'A ${a.b.b1} ${a.b.b2} C',
      b: {
        b1: 'B',
        b2: 'BB'
      }
    }
  }

  var expected = {
    a: {
      a1: 'A B BB C',
      b: {
        b1: 'B',
        b2: 'BB'
      }
    }
  }

  var actual = recurpolate(fixture)

  expect(actual).toEqual(expected)
})

test('circular throws on resolving', () => {
  var fixture = {
    a: '${b}',
    b: '${a}'
  }

  expect(function () {
    recurpolate(fixture)
  }).toThrow('self-reference')
})

test('circular throws on resolving with arrays', () => {
  var fixture = {
    a: [ '${b[0]}' ],
    b: [ '${a[0]}' ]
  }

  expect(function () {
    recurpolate(fixture)
  }).toThrow('self-reference')
})

test('circular 3-way throws on resolving', () => {
  var fixture = {
    a: 'b${b}',
    b: 'c${c}',
    c: 'a${a}'
  }

  expect(function () {
    recurpolate(fixture)
  }).toThrow('repeated reference')
})

test('circular 3-way throws on resolving with arrays', () => {
  var fixture = {
    a: [ 'b${ b[0] }' ],
    b: [ 'c${ c[0]}' ],
    c: [ 'a${a[0] }' ]
  }

  expect(function () {
    var actual = recurpolate(fixture)
    console.log('actual', actual)
  }).toThrow('repeated reference')
})

test('circular object reference', () => {
  var a = {
    b: '${c}'
  }
  a.a = a
  var fixture = {
    a: a,
    c: 'C'
  }

  expect(function () {
    recurpolate(fixture)
  }).toThrow('circular object reference')
})

test('max depth option of 0 prevents resolving', () => {
  var fixture = {
    a: '${b}',
    b: '${a}'
  }

  var expected = {
    a: '${b}',
    b: '${a}'
  }

  var actual = recurpolate(fixture, {
    maxDepth: 0
  })
})

test('interpolate numbers', () => {
  var fixture = {
    a: '${b}',
    b: 2
  }

  var expected = {
    a: '2',
    b: 2
  }

  var actual = recurpolate(fixture)

  expect(actual).toEqual(expected)
})

test('interpolate objects', () => {
  var fixture = {
    a: '${b}',
    b: {
      c: 1
    }
  }

  var expected = {
    a: '[object Object]',
    b: {
      c: 1
    }
  }

  var actual = recurpolate(fixture)

  expect(actual).toEqual(expected)
})

describe('handle on undefined references', () => {
  it('should replace with nothing', () => {
    var fixture = {
      a: 'A${b}',
      c: 'C${d}',
      d: 'D'
    }

    var expected = {
      a: 'A',
      c: 'CD',
      d: 'D'
    }

    var actual = recurpolate(fixture)

    expect(actual).toEqual(expected)
  })

  it('should keep references if requested', () => {
    var fixture = {
      a: 'A${b}',
      c: 'C${d}',
      d: 'D'
    }

    var expected = {
      a: 'A${b}',
      c: 'CD',
      d: 'D'
    }

    var actual = recurpolate(fixture, {
      replaceUnresolved: 'keep'
    })

    expect(actual).toEqual(expected)
  })

  it('should throw if requested', () => {
    var fixture = {
      a: 'A${b}',
      c: 'C${d}',
      d: 'D'
    }

    expect(function () {
      recurpolate(fixture, {
        reportUnresolved: 'throw'
      })
    }).toThrow('undefined reference')
  })
})

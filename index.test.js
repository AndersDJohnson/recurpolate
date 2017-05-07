var recurpolate = require('.')

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

test('circular gives up on resolving', () => {
  var fixture = {
    a: '${b}',
    b: '${a}'
  }

  expect(function () {
    recurpolate(fixture)
  }).toThrow('self-reference')
})

test('circular 3-way gives up on resolving', () => {
  var fixture = {
    a: 'b${b}',
    b: 'c${c}',
    c: 'a${a}'
  }

  expect(function () {
    recurpolate(fixture)
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
  test('replace with nothing', () => {
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

  test('keep references if requested', () => {
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
      forUndefined: 'keep'
    })

    expect(actual).toEqual(expected)
  })

  test('throw if requested', () => {
    var fixture = {
      a: 'A${b}',
      c: 'C${d}',
      d: 'D'
    }

    expect(function () {
      recurpolate(fixture, {
        onUndefined: 'throw'
      })
    }).toThrow('undefined reference')
  })
})

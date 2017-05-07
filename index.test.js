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

// test('circular object reference', () => {
//   var a = {
//     b: 'b'
//   }
//   a.a = a
//   var fixture = {
//     a: a
//   }
//
//   recurpolate(fixture)
// })

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

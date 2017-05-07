# recurpolate
> Recursive, self-referential interpolation of objects.

[![npm](https://img.shields.io/npm/v/recurpolate.svg)](https://npmjs.org/package/recurpolate)
[![Build Status](https://img.shields.io/travis/adjohnson916/recurpolate.svg)](https://travis-ci.org/adjohnson916/recurpolate)
[![Code Coverage](https://img.shields.io/codecov/c/github/adjohnson916/recurpolate.svg)](https://codecov.io/gh/adjohnson916/recurpolate)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Useful e.g. to DRY up configurations, à la Spring.

Supports array references (e.g. `a.b[3].c`).
Should detect circular references and throw error.

## Install

```
npm install --save recurpolate
```

## Use 

```js
import recurpolate from 'recurpolate'

const obj = {
  api: {
    base: 'https://api.example.com',
    v0: '${api.base}/v0',
    v1: '${api.base}/v1',
    last: '${api.v1}'
  },
  services: {
    profile: '${api.last}/profile',
    fullProfile: '${services.profile}?view=full',
    login: '${api.last}/login'
  }
}

const resolved = recurpolate(obj)

console.log(resolved)
```
yields:
```js
{
  base: {
    api: {
      base: 'https://api.example.com',
      v0: 'https://api.example.com/v0',
      v1: 'https://api.example.com/v1',
      last: 'https://api.example.com/v1'
    },
  },
  services: {
    profile: 'https://api.example.com/v1/profile',
    fullProfile: 'https://api.example.com/v1/profile?view=full',
    login: 'https://api.example.com/v1/login'
  }
}
```

### Options

```js
const options = { /* ... */ }
recurpolate(obj, options)
```

#### `maxDepth`
> `{Number} [=null]`

Used to prevent long processing times or
infinite loops due to circular references missed by the library.

#### `reportUnresolved`
> `{String} [='warn']`

Reporting behavior when encountering a reference that resolves to an `undefined` value.

* `'warn'`, `'error'`, etc. - any method on `console`
* `'throw'` - throws an error when
* `'quiet'` - no warnings

#### `replaceUnresolved`
> `{String} [='empty']`

Replacement behavior when encountering a reference that resolves to an `undefuned` value.

* `'empty'` - removes the references from the strings, replacing with empty string
* `'keep'` - keeps the references in the strings, e.g. `${some.undefined.value}`

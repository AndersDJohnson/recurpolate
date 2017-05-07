# recurpolate

Recursive, self-referential interpolation of objects.

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

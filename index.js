var traverse = require('traverse')
var get = require('lodash.get')
var es6TemplateRegex = require('es6-template-regex')

module.exports = function(obj, options) {
  options = Object.assign({
    maxDepth: null,
    onUndefined: 'warn', // or 'throw', 'error', 'quiet'
    forUndefined: 'empty' // or 'keep'
  }, options)
  var maxDepth = options.maxDepth
  var onUndefined = options.onUndefined
  var forUndefined = options.forUndefined

  var again = true
  var refs = {}
  var keepRefs = {}
  var i = 0
  while (again) {
    ++i
    if (maxDepth !== null && i > maxDepth) {
      return obj
    }
    var any = false
    obj = traverse(obj).map(function (value) {
      if (this.circular) {
        throw new Error('unsupported circular object reference')
      }
      if (typeof value !== 'string') return
      if (!value.match(es6TemplateRegex())) return

      var allRefs = []
      value.replace(es6TemplateRegex(), function (m, expr) {
        allRefs.push(expr)
      })

      var path = this.path.join('.')

      refs[path] = refs[path] || {}
      keepRefs[path] = keepRefs[path] || {}

      if (keepRefs[path]) {
        var keepAllRefs = allRefs.reduce(function (acc, ref) {
          return acc && keepRefs[path][ref]
        }, true)
        if (keepAllRefs) return
      }

      any = true

      var newValue = value.replace(es6TemplateRegex(), function (m, expr) {
        if (keepRefs[path][expr]) {
          return m;
        }
        if (path === expr) {
          throw new Error('self-reference at path "' + path + '"')
        }
        if (refs[path][expr]) {
          throw new Error('repeated reference to "' + expr + '" at path "' + path + '"')
        }
        refs[path][expr] = true
        var resolved = get(obj, expr)
        if (resolved === undefined) {
          var message = 'undefined reference "' + expr + '"'
          if (onUndefined === 'throw') {
            throw new Error(message)
          } else if (onUndefined !== 'quiet') {
            console[onUndefined](message)
          }
          if (forUndefined === 'keep') {
            keepRefs[path][expr] = true;
            return m
          }
          return ''
        }
        return resolved
      })

      this.update(newValue)
    })
    again = again && any
  }
  return obj
}

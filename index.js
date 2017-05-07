var traverse = require('traverse')
var get = require('lodash.get')
var es6TemplateRegex = require('es6-template-regex')

module.exports = function(obj, options) {
  options = Object.assign({
    maxDepth: null
  }, options)
  var maxDepth = options.maxDepth
  var again = true
  var refs = {}
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

      any = true

      var path = this.path.join('.')

      refs[path] = refs[path] || {}

      var newValue = value.replace(es6TemplateRegex(), function (m, expr) {
        if (path === expr) {
          throw new Error('self-reference at path "' + path + '"')
        }
        if (refs[path][expr]) {
          throw new Error('repeated reference to "' + expr + '" at path "' + path + '"')
        }
        refs[path][expr] = true
        return get(obj, expr)
      })

      this.update(newValue)
    })
    again = again && any
  }
  return obj
}

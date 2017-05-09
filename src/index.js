var traverse = require('traverse')
var get = require('lodash.get')
var es6TemplateRegex = require('es6-template-regex')

function normalizeExpression (expr) {
  return expr.trim().replace(/\[(\d+)\]/g, '.$1')
}

module.exports = function (obj, options) {
  options = Object.assign({
    context: null,
    maxDepth: null,
    reportUnresolved: 'warn', // or 'throw', 'error', 'quiet'
    replaceUnresolved: 'empty' // or 'keep'
  }, options)
  var context = options.context
  var maxDepth = options.maxDepth
  var reportUnresolved = options.reportUnresolved
  var replaceUnresolved = options.replaceUnresolved

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

      var keepAllRefs = allRefs.reduce(function (acc, ref) {
        var normRef = normalizeExpression(ref)
        return acc && keepRefs[path][normRef]
      }, true)
      if (keepAllRefs) return

      any = true

      var newValue = value.replace(es6TemplateRegex(), function (m, expr) {
        expr = expr.trim()
        var normExpr = normalizeExpression(expr)
        if (path === normExpr) {
          throw new Error('self-reference at path "' + path + '"')
        }
        if (refs[path][normExpr]) {
          throw new Error('repeated reference to "' + expr + '" at path "' + path + '"')
        }
        refs[path][normExpr] = true
        var resolved = get(obj, expr) || get(context, expr)
        if (resolved === undefined) {
          var message = 'unresolved reference "' + expr + '"'
          if (reportUnresolved === 'throw') {
            throw new Error(message)
          } else if (reportUnresolved !== 'quiet') {
            console[reportUnresolved](message)
          }
          if (replaceUnresolved === 'keep') {
            keepRefs[path][normExpr] = true
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

module.exports.normalizeExpression = normalizeExpression

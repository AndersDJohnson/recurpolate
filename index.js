var traverse = require('traverse')
var template = require('lodash.template')

function hasExpression(value) {
  return /\$\{/.test(value)
}

function process(obj, prevs) {
  var done = true
  var newObj = traverse(obj).map(function (value) {
    if (typeof value === 'string' && hasExpression(value)) {
      var dotPath = this.path.join('.')
      var newValue = template(value)(obj)
      if (newValue !== prevs[dotPath]) {
        prevs[dotPath] = value
        this.update(newValue)
        done = done ? !hasExpression(newValue) : done
      }
    }
  })

  if (!done) {
    return process(newObj, prevs)
  }

  return newObj
}

module.exports = function(obj, options) {
  var prevs = {};
  return process(obj, prevs)
}

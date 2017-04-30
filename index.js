var traverse = require('traverse')
var template = require('lodash.template')

module.exports = function(obj, options) {
  options = Object.assign({
    maxDepth: 10
  }, options)
  var again = true
  var i = 0
  while (again) {
    ++i
    if (i > options.maxDepth) {
      return obj
    }
    var any = false
    obj = traverse(obj).map(function (x) {
      if (typeof x !== 'string') return
      var v = template(x)(obj)
      // console.log(`"${x}" => "${v}"`)
      any = any || v.indexOf('${') > -1
      this.update(v)
    })
    again = again && any
  }
  return obj
}

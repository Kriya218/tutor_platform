module.exports = {
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  isInclude: function (a, b) {
    if (Array.isArray(a)) return a.includes(b)
    if (a === b) return a.includes(b)
    return false
  },
  ifIsNaN : function (a, b, options) {
    return isNaN(a) && isNaN(b) ? options.fn(this) : options.inverse(this)
  }
}
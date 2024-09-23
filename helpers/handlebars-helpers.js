module.exports = {
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  isInclude: function (a, b) {
    if (Array.isArray(a)) return a.includes(b) 
    return false
  }
}
const getAvg = arr => arr.reduce((sum, currentValue) => sum + currentValue, 0 ) / arr.length

module.exports = {
  getAvg
}
const dayjs = require('dayjs')
const getAvailableDate = (opendays, courseDuration, days) => {
  const now = dayjs()
  // get next 14 days date
  const dateArr = Array.from({ length: opendays }, (_, i) => {
    const date = now.add(i + 1, 'day')
    return {
      date: date.format("YYYY/MM/D"),
      day: date.format("dddd").toLowerCase()
    }
  })
  // filter tutor available date
  const availableDate = dateArr.filter(date => days.includes(date.day))

  // get time slot according course duration
  const startTime = dayjs().set('hour', 18).set('minute', 0)
  const endTime = dayjs().set('hour', 22).set('minute', 0)
  const timeSlots = []
  let currentTime = startTime
  while(currentTime.isBefore(endTime)) {
    const nextTime = currentTime.add(parseInt(courseDuration), 'minute')
    if (nextTime.isBefore(endTime) || nextTime.isSame(endTime)) {
      const slot = `${currentTime.format('HH:mm')} - ${nextTime.format('HH:mm')}`
      timeSlots.push(slot)
    }
    currentTime = nextTime
  }
  
  return availableDate.flatMap(date => timeSlots.map(slot => `${date.date} ${date.day} ${slot}`))
}

module.exports = getAvailableDate

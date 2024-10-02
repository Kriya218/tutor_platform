const dayjs = require('dayjs')

function getAvailableDate (opendays, courseDuration, days, appointmentInfo) {
  const now = dayjs()
  const availableSlots = []
  Array.from({ length: opendays }, (_, i) => {
    const currentDate = now.add(i + 1, 'day')
    const dayOfWeek = currentDate.format('dddd')
    
    if (days.includes(dayOfWeek)) { 
      const daySlots = getDaySlots(currentDate, courseDuration)
      const filteredSlots = filterBookedSlots(currentDate, daySlots, appointmentInfo)

      if (filteredSlots.length > 0) {
        availableSlots.push({
          date: currentDate.format('YYYY-MM-DD'),
          dayOfWeek,
          slots: filteredSlots
        })
      }
    }
  })
  return availableSlots
}

function getDaySlots(date, duration) {
  const slots = []
  let currentTime = date.hour(18).minute(0)
  const endTime = date.hour(22).minute(0)
  while(currentTime.add(parseInt(duration), 'minute').isBefore(endTime) || currentTime.add(parseInt(duration), 'minute').isSame(endTime)) {
    slots.push({
      start: currentTime.format('HH:mm'),
      end: currentTime.add(parseInt(duration), 'minute').format('HH:mm')
    })
    currentTime = currentTime.add(parseInt(duration), 'minute')
  }
  return slots
}

function filterBookedSlots(date, daySlots, appointments) {
  const dateStr = date.format('YYYY-MM-DD')
  return daySlots.filter(slot => {
    const slotStart = dayjs(`${dateStr} ${slot.start}`)
    const slotEnd = dayjs(`${dateStr} ${slot.end}`)
    return !appointments.some(booked => {
      const date = dayjs(booked.appointmentDate).format('YYYY-MM-DD')
      const bookedStart = dayjs(`${date} ${booked.startTime}`)
      const bookedEnd = dayjs(`${date} ${booked.endTime}`)
      return slotEnd.isAfter(bookedStart) && slotStart.isBefore(bookedEnd)
    })
  })
}

function isOverlap(st1, et1, st2, et2, date) {
  const [startTime1, endTime1, startTime2, endTime2] = [dayjs(`${date} ${st1}`), dayjs(`${date} ${et1}`), dayjs(`${date} ${st2}`), dayjs(`${date} ${et2}`)]
  return endTime1.isAfter(startTime2) && startTime1.isBefore(endTime2)
}

function isFinished(date, time) {
  const now = dayjs()
  const courseEndTime = dayjs(`${date} ${time}`)
  return now.isAfter(courseEndTime)
}

module.exports = { getAvailableDate, isOverlap, isFinished }

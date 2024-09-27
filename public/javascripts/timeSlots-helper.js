export function getDynamicSlots (timeSlots) {

  const availableSlots = JSON.parse(timeSlots)
  const dateSelect = document.getElementById('appointmentDate')
  const timeSelect = document.getElementById('courseTime')
  console.log('typeof:', typeof availableSlots) 

  availableSlots.forEach(slot => {
    const option = document.createElement('option')
    option.value = slot.date
    option.textContent = `${slot.date} (${slot.dayOfWeek})`
    dateSelect.appendChild(option)
  })
  function updateTimeSlots() {
    timeSelect.innerHTML = '<option selected>請選擇時段</option>'
    const selectedDate = dateSelect.value
    const selectedDateSlots = availableSlots.find(slot => slot.date === selectedDate)
    if (selectedDateSlots) {
      selectedDateSlots.slots.forEach(timeSlot => {
        const option = document.createElement('option')
        option.value = timeSlot.start - timeSlot.end
        option.textContent = `${timeSlot.start} - ${timeSlot.end}`
        timeSelect.appendChild(option)
      }
      )
    }
  }
  dateSelect.addEventListener('change', updateTimeSlots)
  updateTimeSlots()
}

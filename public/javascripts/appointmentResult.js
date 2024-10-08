
export function appointmentResult(tutorId) {
  document.getElementById('appointmentForm').addEventListener('submit', evt => {
    evt.preventDefault()
    const formData = new URLSearchParams(new FormData(evt.target))
    const appointmentDate = formData.get('appointmentDate')
    const courseTime = formData.get('courseTime')
    fetch(`/appointments/${tutorId}`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const appointmentDate = new Date(data.appointmentDate);
          const formattedDate = appointmentDate.toISOString().slice(0, 10)
          document.getElementById('modalBody').innerHTML=`
            <p>預約成功！</p>
            <p><strong>教師</strong>：${data.tutorName}</p>
            <p><strong>課程</strong>：${data.courseName}</p>
            <p><strong>上課時間</strong>：${formattedDate} ${data.courseTime}</p>
            <p><strong>上課連結</strong>：<a href="${data.meetingLink}" target="_blank">${data.meetingLink}</a></p>`
        } else if (data.error_msg) {
          document.getElementById('modalBody').innerHTML=`
          <p>預約失敗</p>
          <p>${data.error_msg}</p>`
        }else {
          document.getElementById('modalBody').innerHTML=`
          <p>預約失敗</p>
          <p>${data.courseTime} 時段已有人預約，請選擇其他時段</p>`
        }
        const resultModal = new bootstrap.Modal(document.getElementById('resultModal'))
        resultModal.show() 
      })
      .catch(err => {
        document.getElementById('modalBody').innerHTML = `<p>預約失敗，請稍後再試</p>`
        const resultModal = new bootstrap.Modal(document.getElementById('resultModal'))
        resultModal.show()
        console.error('Error:', err)
      })
  })
  document.getElementById('redirectBtn').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('resultModal'))
    modal.hide()
    window.location.href = `/tutors/${tutorId}/profile`
  })
} 
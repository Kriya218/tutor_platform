export function feedbackResult(userId) {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', evt => {
      evt.preventDefault()

      const formData = new URLSearchParams(new FormData(evt.target))
      const appointmentId = form.querySelector('.feedback-btn').getAttribute('data-id')
      const rating = formData.get('rating')
      const description = formData.get('description')
      fetch(`/feedbacks/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('dataFE:', data)
            document.getElementById('modalBody').innerHTML=`
            <p>回饋提交成功!</p>
            <p><strong>教師</strong>: ${data.tutorName}</p>
            <p><strong>評分</strong>: ${data.rating}</p>
            <p><strong>回饋</strong>: ${data.description}</p>`
          }
          const resultModal = new bootstrap.Modal(document.getElementById('resultModal'))
          resultModal.show()
        })
        .catch(err => {
          document.getElementById('modalBody').innerHTML = `<p>提交回饋失敗，請稍後再試</p>`
          const resultModal = new bootstrap.Modal(document.getElementById('resultModal'))
          resultModal.show()
          console.error('Error:', err)
        })
    })
  })
  document.getElementById('redirectBtn').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('resultModal'))
    modal.hide()
    window.location.href = `/user/${userId}`
  })
}
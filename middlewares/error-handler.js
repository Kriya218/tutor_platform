module.exports = {
  generalErrorHandler (err, req, res, next) {
    const statusCode = err.status || 500
    if (err instanceof Error) {
      req.flash('status_code', statusCode)
      req.flash('error_msg', `${err.name}: ${err.message}`)
    } else {
      req.flash('error_msg', `${err}`)
      req.flash('status_code', 500)
    }
    res.redirect('back')
    next(err)
  }
}
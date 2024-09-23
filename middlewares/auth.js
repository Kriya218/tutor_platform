const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next() 
  }
  req.flash('error_msg', '請先登入')
  return res.redirect('/signin')
}

module.exports = {
  authenticated
}
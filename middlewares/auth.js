const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next() 
  }
  req.flash('error_msg', '請先登入')
  return res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role === 'admin') { 
      return next()
    }
    res.redirect('/')
  } else {
    res.redirect('/signin')
  }
}


module.exports = {
  authenticated,
  authenticatedAdmin
}
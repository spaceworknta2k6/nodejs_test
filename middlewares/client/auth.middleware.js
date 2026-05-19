module.exports.requireAuth = (req, res, next) => {
  if (res.locals.currentUser) {
    return next();
  }

  req.flash("error", "Vui lòng đăng nhập để tiếp tục.");
  res.redirect("/user/login");
};

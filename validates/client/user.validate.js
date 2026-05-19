const redirectBack = (req, res, fallback) => {
  return res.redirect(req.get("referer") || fallback);
};

module.exports.register = (req, res, next) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !fullName.trim()) {
    req.flash("error", "Vui lòng nhập họ tên.");
    return redirectBack(req, res, "/user/register");
  }

  if (!email || !email.trim()) {
    req.flash("error", "Vui lòng nhập email.");
    return redirectBack(req, res, "/user/register");
  }

  if (!password) {
    req.flash("error", "Vui lòng nhập mật khẩu.");
    return redirectBack(req, res, "/user/register");
  }

  if (password.length < 6) {
    req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự.");
    return redirectBack(req, res, "/user/register");
  }

  if (password !== confirmPassword) {
    req.flash("error", "Mật khẩu xác nhận không khớp.");
    return redirectBack(req, res, "/user/register");
  }

  next();
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    req.flash("error", "Vui lòng nhập email.");
    return redirectBack(req, res, "/user/login");
  }

  if (!password) {
    req.flash("error", "Vui lòng nhập mật khẩu.");
    return redirectBack(req, res, "/user/login");
  }

  next();
};

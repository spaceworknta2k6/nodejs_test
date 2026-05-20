const md5 = require("md5");
const User = require("../../models/user.model");
const generate = require("../../helper/generate");
const uploadToCloudinary = require("../../helper/uploadToCloudinary");

const normalizeEmail = (email) => {
  return String(email || "").trim().toLowerCase();
};

const getCurrentUser = async (req, res) => {
  if (res.locals.currentUser) {
    return res.locals.currentUser;
  }

  const token = req.cookies.userToken;

  if (!token) {
    return null;
  }

  return User.findOne({
    token,
    deleted: false,
    status: "active",
  }).select("-password");
};

const redirectIfLoggedIn = async (req, res) => {
  const token = req.cookies.userToken;

  if (!token) {
    return false;
  }

  const user = await User.findOne({
    token,
    deleted: false,
    status: "active",
  });

  if (!user) {
    res.clearCookie("userToken");
    return false;
  }

  res.redirect("/");
  return true;
};

module.exports.register = async (req, res) => {
  if (await redirectIfLoggedIn(req, res)) {
    return;
  }

  res.render("client/pages/user/register", {
    TitlePage: "Đăng ký tài khoản",
  });
};

module.exports.registerPost = async (req, res) => {
  const email = normalizeEmail(req.body.email);

  const existingUser = await User.findOne({
    email,
    deleted: false,
  });

  if (existingUser) {
    req.flash("error", "Email này đã được đăng ký.");
    return res.redirect("/user/register");
  }

  const user = new User({
    fullName: String(req.body.fullName || "").trim(),
    email,
    phone: String(req.body.phone || "").trim(),

    password: md5(req.body.password),
    token: generate.generateRandomString(32),
    status: "active",
  });

  await user.save();

  res.cookie("userToken", user.token, {
    httpOnly: true,
    sameSite: "lax",
  });
  req.flash("success", "Đăng ký tài khoản thành công.");
  res.redirect("/");
};

module.exports.login = async (req, res) => {
  if (await redirectIfLoggedIn(req, res)) {
    return;
  }

  res.render("client/pages/user/login", {
    TitlePage: "Đăng nhập",
  });
};

module.exports.loginPost = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({
    email,
    deleted: false,
  });

  if (!user) {
    req.flash("error", "Email không tồn tại.");
    return res.redirect("/user/login");
  }

  if (user.password !== md5(req.body.password)) {
    req.flash("error", "Sai mật khẩu.");
    return res.redirect("/user/login");
  }

  if (user.status !== "active") {
    req.flash("error", "Tài khoản đã bị khóa.");
    return res.redirect("/user/login");
  }

  res.cookie("userToken", user.token, {
    httpOnly: true,
    sameSite: "lax",
  });
  req.flash("success", "Đăng nhập thành công.");
  res.redirect("/");
};

module.exports.profile = (req, res) => {
  if (!res.locals.currentUser) {
    req.flash("error", "Vui lòng đăng nhập để xem tài khoản.");
    return res.redirect("/user/login");
  }

  res.render("client/pages/user/profile", {
    TitlePage: "Thông tin tài khoản",
  });
};

module.exports.edit = async (req, res) => {
  const user = await getCurrentUser(req, res);

  if (!user) {
    req.flash("error", "Vui lòng đăng nhập để chỉnh sửa tài khoản.");
    return res.redirect("/user/login");
  }

  res.render("client/pages/user/edit", {
    TitlePage: "Chỉnh sửa tài khoản",
    profileUser: user,
  });
};

module.exports.editPost = async (req, res) => {
  const user = await getCurrentUser(req, res);

  if (!user) {
    req.flash("error", "Vui lòng đăng nhập để chỉnh sửa tài khoản.");
    return res.redirect("/user/login");
  }

  const fullName = String(req.body.fullName || "").trim();

  if (!fullName) {
    req.flash("error", "Vui lòng nhập họ tên.");
    return res.redirect("/user/profile/edit");
  }

  const updateData = {
    fullName,
    phone: String(req.body.phone || "").trim(),
  };

  if (req.file && req.file.buffer) {
    const uploadedImage = await uploadToCloudinary(req.file.buffer, "users");
    updateData.avatar = uploadedImage.secure_url;
  }

  await User.updateOne({ _id: user._id }, updateData);

  req.flash("success", "Cập nhật thông tin tài khoản thành công.");
  res.redirect("/user/profile");
};

module.exports.changePassword = async (req, res) => {
  const user = await getCurrentUser(req, res);

  if (!user) {
    req.flash("error", "Vui lòng đăng nhập để đổi mật khẩu.");
    return res.redirect("/user/login");
  }

  res.render("client/pages/user/password", {
    TitlePage: "Thay đổi mật khẩu",
  });
};

module.exports.changePasswordPost = async (req, res) => {
  const token = req.cookies.userToken;
  const user = await User.findOne({
    token,
    deleted: false,
    status: "active",
  });

  if (!user) {
    req.flash("error", "Vui lòng đăng nhập để đổi mật khẩu.");
    return res.redirect("/user/login");
  }

  const currentPassword = String(req.body.currentPassword || "");
  const newPassword = String(req.body.newPassword || "");
  const confirmPassword = String(req.body.confirmPassword || "");

  if (user.password !== md5(currentPassword)) {
    req.flash("error", "Mật khẩu hiện tại không đúng.");
    return res.redirect("/user/profile/password");
  }

  if (newPassword.length < 6) {
    req.flash("error", "Mật khẩu mới phải có ít nhất 6 ký tự.");
    return res.redirect("/user/profile/password");
  }

  if (newPassword !== confirmPassword) {
    req.flash("error", "Mật khẩu xác nhận không khớp.");
    return res.redirect("/user/profile/password");
  }

  await User.updateOne(
    { _id: user._id },
    {
      password: md5(newPassword),
    },
  );

  req.flash("success", "Thay đổi mật khẩu thành công.");
  res.redirect("/user/profile");
};

module.exports.logout = (req, res) => {
  res.clearCookie("userToken");
  req.flash("success", "Đăng xuất thành công.");
  res.redirect("/");
};

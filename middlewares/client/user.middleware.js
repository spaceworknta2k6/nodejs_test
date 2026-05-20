const User = require("../../models/user.model");

module.exports.infoUser = async (req, res, next) => {
  const token = req.cookies.userToken;
  res.locals.currentUser = null;

  if (!token) {
    return next();
  }

  try {
    const user = await User.findOne({
      token,
      deleted: false,
      status: "active",
    }).select("-password");

    if (!user) {
      res.clearCookie("userToken");
      return next();
    }

    res.locals.currentUser = user;
    next();
  } catch (error) {
    console.error("Client user middleware error:", error);
    next();
  }
};

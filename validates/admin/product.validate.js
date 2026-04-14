const systemConfig = require("../../config/system");

module.exports.createPost = (req, res, next) => {
  if (!req.body.title || !req.body.title.trim()) {
    req.flash("error", "Vui lòng nhập tiêu đề sản phẩm");
    const referer = req.get("referer");
    return res.redirect(referer || `${systemConfig.prefixAdmin}/product/create`);
  }
  if (!req.body.price) {
    req.flash("error", "Vui lòng nhập giá tiền");
    const referer = req.get("referer");
    return res.redirect(referer || `${systemConfig.prefixAdmin}/product/create`);
  }

  if (!req.body.discountPercentage) {
    req.flash("error", "Vui lòng nhập phần trăm giảm giá");
    const referer = req.get("referer");
    return res.redirect(referer || `${systemConfig.prefixAdmin}/product/create`);
  }
  next();
};

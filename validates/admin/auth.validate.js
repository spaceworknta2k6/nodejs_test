const SystemConfig = require("../../config/system")
module.exports.login = (req, res, next) => {
    if (!req.body.email) {
        req.flash("error", "vui lòng nhập email");
        res.redirect(`${SystemConfig.prefixAdmin}/auth/login`);
        return;
    }
    if (!req.body.password) {
        req.flash("error", "vui lòng nhập mật khẩu");
        res.redirect(`${SystemConfig.prefixAdmin}/auth/login`);
        return;
    }
    next();
}
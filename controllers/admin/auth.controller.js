const Account = require("../../models/account.model");
const SystemConfig = require("../../config/system");
const md5 = require("md5");
// [GET] /admin/auth/login
module.exports.login = async (req, res) => {
    const token = req.cookies.token;
    if (token) {
        // Xác thực token với DB, tránh redirect loop khi token cũ/không hợp lệ
        const user = await Account.findOne({ token, deleted: false });
        if (user) {
            res.redirect(`${SystemConfig.prefixAdmin}/dashboard`);
            return;
        }
        // Token không hợp lệ → xóa cookie cũ
        res.clearCookie("token");
    }
    res.render("admin/pages/auth/login", {
        PageTitle: "Đăng nhập"
    });
}

// [POST] /admin/auth/login
module.exports.loginPost = async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    const user = await Account.findOne({
        email: email,
        deleted: false
    })
    if (!user) {
        req.flash("error", "Email không tồn tại");
        res.redirect(`${SystemConfig.prefixAdmin}/auth/login`);
        return;
    }
    if (md5(password) != user.password) {
        req.flash("error", "Sai mật khẩu");
        res.redirect(`${SystemConfig.prefixAdmin}/auth/login`);
        return;
    }
    if (user.status != "active") {
        req.flash("error", "Tài khoản đã bị khóa");
        res.redirect(`${SystemConfig.prefixAdmin}/auth/login`);
        return;
    }
    res.cookie("token", user.token);
    req.flash("success", "Đăng nhập thành công");
    res.redirect(`${SystemConfig.prefixAdmin}/dashboard`);
}

// [GET] /admin/auth/logout
module.exports.logout = async (req, res) => {
    res.clearCookie("token");
    req.flash("success", "Đăng xuất thành công");
    res.redirect(`${SystemConfig.prefixAdmin}/auth/login`);
}
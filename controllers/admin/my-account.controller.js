const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");
const md5 = require("md5");
const uploadToCloudinary = require("../../helper/uploadToCloudinary");

// [GET] /admin/my-account
module.exports.index = async (req, res) => {
    res.render('admin/pages/my-account/index', {
        PageTitle: "Thông tin cá nhân",
        account: res.locals.user
    })
}
// [GET] /admin/my-account/edit/:id
module.exports.edit = async (req, res) => {
    const id = req.params.id;

    if (id !== res.locals.user.id) {
        req.flash("error", "Bạn không có quyền chỉnh sửa tài khoản này!");
        res.redirect(`${systemConfig.prefixAdmin}/my-account`);
        return;
    }

    res.render("admin/pages/my-account/edit", {
        PageTitle: "Chỉnh sửa thông tin cá nhân",
        account: res.locals.user
    });
};
// [PATCH] /admin/my-account/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;

        if (id !== res.locals.user.id) {
            req.flash("error", "Bạn không có quyền chỉnh sửa tài khoản này!");
            res.redirect(`${systemConfig.prefixAdmin}/my-account`);
            return;
        }

        const existAccount = await Account.findOne({
            _id: { $ne: id },
            email: req.body.email,
            deleted: false
        });

        if (existAccount) {
            req.flash("error", "Email đã tồn tại!");
            res.redirect(`${systemConfig.prefixAdmin}/my-account/edit/${id}`);
            return;
        }

        const updateData = {
            fullName: req.body.fullName,
            email: req.body.email
        };

        if (req.body.password) {
            updateData.password = md5(req.body.password);
        }

        if (req.file && req.file.buffer) {
            const uploadedImage = await uploadToCloudinary(req.file.buffer, "accounts");
            updateData.avatar = uploadedImage.secure_url;
        }

        await Account.updateOne({ _id: id, deleted: false }, updateData);

        req.flash("success", "Cập nhật thông tin cá nhân thành công!");
        res.redirect(`${systemConfig.prefixAdmin}/my-account`);
    } catch (error) {
        req.flash("error", "Cập nhật thông tin cá nhân thất bại!");
        res.redirect("back");
    }
}

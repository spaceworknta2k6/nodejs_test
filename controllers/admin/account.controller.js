const Account = require("../../models/account.model")
const Role = require("../../models/roles.model")
const systemConfig = require("../../config/system");
const md5 = require("md5");
const uploadToCloudinary = require("../../helper/uploadToCloudinary");
// [GET] /admin/accounts
module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    }
    const records = await Account.find(find).select("-password -token").populate("role_id", "title");

    res.render("admin/pages/accounts/index", {
        PageTitle: "Danh sách tài khoản",
        records: records
    })
}

// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {
    const roles = await Role.find({ deleted: false })
    res.render("admin/pages/accounts/create", {
        PageTitle: "Thêm mới tài khoản",
        roles: roles
    })
}
//[POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
    try {
        // check email exits
        const exitAccount = await Account.findOne({ email: req.body.email, deleted: false })
        if (exitAccount) {
            req.flash("error", "Email đã tồn tại!");
            res.redirect(`${systemConfig.prefixAdmin}/accounts/create`);
            return;
        }
        // mã hóa passowrd
        req.body.password = md5(req.body.password);

        // upload avatar
        if (req.file && req.file.buffer) {
            const uploadedImage = await uploadToCloudinary(req.file.buffer, "accounts");
            req.body.avatar = uploadedImage.secure_url;
        }

        const records = new Account(req.body);
        await records.save();
        req.flash("success", "Thêm mới tài khoản thành công!");
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    } catch (error) {
        req.flash("error", "Thêm mới tài khoản thất bại!");
    }
}
// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
    const id = req.params.id;

    const record = await Account.findOne({ _id: id, deleted: false }).select("-password -token");
    if (!record) {
        req.flash("error", "Tài khoản không tồn tại!");
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
        return;
    }

    const roles = await Role.find({ deleted: false });

    res.render("admin/pages/accounts/edit", {
        PageTitle: "Chỉnh sửa tài khoản",
        record: record,
        roles: roles
    });
};
// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;

        const exitAccount = await Account.findOne({
            _id: { $ne: id },
            email: req.body.email,
            deleted: false
        });
        if (exitAccount) {
            req.flash("error", "Email đã tồn tại!");
            res.redirect(`${systemConfig.prefixAdmin}/accounts/edit/${id}`);
            return;
        }

        if (req.body.password) {
            req.body.password = md5(req.body.password);
        } else {
            delete req.body.password;
        }

        if (req.file && req.file.buffer) {
            const uploadedImage = await uploadToCloudinary(req.file.buffer, "accounts");
            req.body.avatar = uploadedImage.secure_url;
        }

        await Account.updateOne({ _id: id }, req.body);

        req.flash("success", "Cập nhật tài khoản thành công!");
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    } catch (error) {
        req.flash("error", "Cập nhật tài khoản thất bại!");
        res.redirect("back");
    }
};
// [PATCH] /admin/accounts/delete/:id
module.exports.deleteAccount = async (req, res) => {
    const id = req.params.id;
    await Account.updateOne({ _id: id }, { deleted: true });
    req.flash("success", "Xóa tài khoản thành công")
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
}
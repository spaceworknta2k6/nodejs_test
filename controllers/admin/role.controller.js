const systemConfig = require("../../config/system");

// [GET] /admin/role
const Role = require("../../models/roles.model");
module.exports.index = async (req, res) => {
  const find = {
    deleted: { $ne: true },
  };

  const records = await Role.find(find).sort({ createdAt: -1 });

  res.render("admin/pages/roles/index", {
    PageTitle: "Trang nhom quyen",
    record: records,
  });
};

// [GET] /admin/roles/create

module.exports.create = (req, res) => {
  res.render("admin/pages/roles/create", {
    PageTitle: "Trang tao nhom quyen",
  });
};

// [POST] amin/roles/create
module.exports.createPost = async (req, res) => {
  const record = new Role(req.body);
  await record.save();
  req.flash("success", "Thêm mới thành công");
  res.redirect(`${systemConfig.prefixAdmin}/roles`);
};

// [GET] admin/roles/edit
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const find = {
      _id: id,
      deleted: { $ne: true },
    };

    const record = await Role.findOne(find);

    if (!record) {
      req.flash("error", "Khong tim thay nhom quyen");
      return res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }

    res.render("admin/pages/roles/edit", {
      PageTitle: "Trang chinh sua",
      record: record,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};

// [PATCH] admin/roles/edit
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.updateOne({ _id: id }, req.body);
    req.flash("success", "Cap nhat thanh cong");
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  } catch (error) {
    req.flash("error", "Cap nhat that bai");
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};

// [GET] admin/roles/permission

module.exports.permission = async (req, res) => {
  let find = {
    deleted: false
  }

  const record = await Role.find(find);
  res.render("admin/pages/roles/permission", {
    PageTitle: "Trang phan quyen",
    record: record,
  });
};

// [PATCH] admin/roles/permission
module.exports.permissionPatch = async (req, res) => {
  try {
    const permissions = JSON.parse(req.body.permissions);

    for (const item of permissions) {
      // Lưu ý: Trường trong model là "permission"
      await Role.updateOne({ _id: item.id }, { permission: item.permissions });
    }

    req.flash("success", "Cập nhật phân quyền thành công");
    res.redirect(`${systemConfig.prefixAdmin}/roles/permission`);
  } catch (error) {
    req.flash("error", "Cập nhật phân quyền thất bại");
    res.redirect(`${systemConfig.prefixAdmin}/roles/permission`);
  }
};

// [GET] admin/roles/detail
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const find = {
      _id: id,
      deleted: false
    };

    const record = await Role.findOne(find);

    res.render("admin/pages/roles/detail", {
      PageTitle: "Trang chi tiết nhóm quyền",
      record: record,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};

// [GET] admin/roles/delete
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.updateOne({ _id: id }, { deleted: true });
    req.flash("success", "Bạn đã xóa thành công");
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  } catch (error) {
    req.flash("error", "Xóa thất bại");
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
}

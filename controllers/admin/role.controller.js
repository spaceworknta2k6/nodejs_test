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

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const find = {
      _id: id,
      deleted: false,
    };

    const record = await Role.findOne(find);

    res.render("admin/pages/roles/edit", {
      PageTitle: "Trang chinh sua",
      record: record,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.updateOne({ _id: id }, req.body);
    req.flash("success", "Cap nhat thanh cong");
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  } catch(error) {
    req.flash("error", "Cap nhat that bai");
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};

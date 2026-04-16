// [GET] /admin/product
const Product = require("../../models/product.model");
const sortHelper = require("../../helper/sort");
const systemConfig = require("../../config/system");
const uploadToCloudinary = require("../../helper/uploadToCloudinary");

module.exports.products = async (req, res) => {
  const status = req.query.status || "";
  const keyword = req.query.keyword || "";
  const sortQuery = req.query.sort || "";

  let find = {
    deleted: false,
  };

  if (req.query.status === "active") {
    find.active = true;
  }
  if (req.query.status === "inactive") {
    find.active = false;
  }

  const totalProducts = await Product.countDocuments({
    deleted: false,
  });
  const activeProduct = await Product.countDocuments({
    deleted: false,
    active: true,
  });
  const inactiveProduct = await Product.countDocuments({
    deleted: false,
    active: false,
  });

  if (keyword.trim()) {
    const keywordRegex = new RegExp(keyword.trim(), "i");
    find.$or = [
      { title: keywordRegex },
      { category: keywordRegex },
      { description: keywordRegex },
    ];
  }

  const sort = sortHelper(sortQuery);

  let objectPagination = {
    currentPage: 1,
    limitItem: 6,
  };

  if (req.query.page) {
    objectPagination.currentPage = parseInt(req.query.page, 10);
  }
  const totalpage = await Product.countDocuments(find);
  objectPagination.totalpage = Math.ceil(
    totalpage / objectPagination.limitItem,
  );

  if (
    objectPagination.totalpage > 0 &&
    objectPagination.currentPage > objectPagination.totalpage
  ) {
    objectPagination.currentPage = objectPagination.totalpage;
  }

  if (
    objectPagination.currentPage < 1 ||
    Number.isNaN(objectPagination.currentPage)
  ) {
    objectPagination.currentPage = 1;
  }

  objectPagination.skip =
    (objectPagination.currentPage - 1) * objectPagination.limitItem;

  const product = await Product.find(find)
    .sort(sort)
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);
  res.render("admin/pages/product/index", {
    PageTitle: "Trang sản phẩm",
    product: product,
    status: status,
    keyword: keyword,
    sort: sortQuery,
    totalProducts: totalProducts,
    activeProduct: activeProduct,
    inactiveProduct: inactiveProduct,
    pagination: objectPagination,
  });
};

module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await Product.updateOne({ _id: id }, { active: status });

  req.flash("success", "Status update successful");
  res.redirect("/admin/product");
};

module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  await Product.updateOne(
    { _id: id },
    { deleted: true, deletedAt: new Date() },
  );
  const referer = req.get("referer");
  req.flash("success", "Product deleted successfully");
  res.redirect(referer || "/admin/product");
};

module.exports.changeMulti = async (req, res) => {
  const type = req.body.bulkAction;
  const ids = req.body.ids ? req.body.ids.split(",") : [];

  if (!type || ids.length === 0) {
    const referer = req.get("referer");
    return res.redirect(referer || "/admin/product");
  }
  switch (type) {
    case "active":
      await Product.updateMany({ _id: { $in: ids } }, { active: true });
      break;
    case "inactive":
      await Product.updateMany({ _id: { $in: ids } }, { active: false });
      break;
    case "delete":
      await Product.updateMany(
        { _id: { $in: ids } },
        { deleted: true, deleteAt: new Date() },
      );
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position, 10);
        await Product.updateOne({ _id: id }, { position: position });
      }
      break;
  }

  req.flash("success", "Status update successful");

  const referer = req.get("referer");
  res.redirect(referer || "/admin/product");
};

module.exports.create = (req, res) => {
  res.render("admin/pages/product/create", {
    PageTitle: "Trang tạo sản phẩm",
  });
};

module.exports.createPost = async (req, res) => {
  if (req.body.position != "") {
    req.body.position = parseInt(req.body.position, 10);
  } else {
    const count = await Product.countDocuments();
    req.body.position = count + 1;
  }

  if (req.body.rating != "") {
    req.body.rating = parseFloat(req.body.rating);
  }

  req.body.price = parseFloat(req.body.price);
  req.body.discountPercentage = parseFloat(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock, 10) || 0;

  const uploadedImages =
    Array.isArray(req.files) && req.files.length > 0
      ? await Promise.all(
          req.files.map((file) => uploadToCloudinary(file.buffer, "products")),
        )
      : [];

  req.body.images = uploadedImages.map((file) => file.secure_url);

  if (req.body.images.length > 0) {
    req.body.thumbnail = req.body.images[0];
  }

  const product = new Product(req.body);
  await product.save();
  req.flash("success", "Thêm sản phẩm thành công");
  res.redirect(`${systemConfig.prefixAdmin}/product`);
};

module.exports.edit = async (req, res) => {
  try {
    const product = await Product.findOne({
      deleted: false,
      _id: req.params.id,
    });

    res.render("admin/pages/product/edit", {
      PageTitle: "Trang chỉnh sửa",
      product: product,
    });
  } catch (error) {
    req.flash("error", "Vui lòng thử lại");
    res.redirect(`${systemConfig.prefixAdmin}/product`);
  }
};

module.exports.detail = async (req, res) => {
  try {
    const product = await Product.findOne({
      deleted: false,
      _id: req.params.id,
    });

    if (!product) {
      req.flash("error", "Không tìm thấy sản phẩm");
      return res.redirect(`${systemConfig.prefixAdmin}/product`);
    }

    const gallery =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.thumbnail
          ? [product.thumbnail]
          : [];

    res.render("admin/pages/product/detail", {
      PageTitle: "Chi tiết sản phẩm",
      product,
      gallery,
    });
  } catch (error) {
    req.flash("error", "Vui lòng thử lại");
    return res.redirect(`${systemConfig.prefixAdmin}/product`);
  }
};

module.exports.editPatch = async (req, res) => {
  const id = req.params.id;
  try {
    if (req.body.position != "") {
      req.body.position = parseInt(req.body.position, 10);
    }

    if (req.body.rating != "") {
      req.body.rating = parseFloat(req.body.rating);
    }

    req.body.price = parseFloat(req.body.price);
    req.body.discountPercentage = parseFloat(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock, 10) || 0;

    if (Array.isArray(req.files) && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer, "products")),
      );

      req.body.images = uploadedImages.map((file) => file.secure_url);
      req.body.thumbnail = req.body.images[0];
    } else {
      delete req.body.images;
      delete req.body.thumbnail;
    }

    await Product.updateOne({ _id: id }, req.body);
    req.flash("success", "Cập nhật thành công");
    return res.redirect(`${systemConfig.prefixAdmin}/product`);
  } catch (error) {
    req.flash("error", "Vui lòng thử lại");
    return res.redirect(`${systemConfig.prefixAdmin}/product`);
  }
};

// [GET] /admin/product
const Product = require("../../models/product.model");
const sortHelper = require("../../helper/sort");
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
  // stat-card
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

  // end stat-card

  // submitButton
  if (keyword.trim()) {
    const keywordRegex = new RegExp(keyword.trim(), "i");
    find.$or = [
      { title: keywordRegex },
      { category: keywordRegex },
      { description: keywordRegex },
    ];
  }
  // sort

  const sort = sortHelper(sortQuery);
  // end sort

  // end submitButton

  // pagination
  let objectPagination = {
    currentPage: 1,
    limitItem: 6,
  };

  if (req.query.page) {
    objectPagination.currentPage = parseInt(req.query.page);
  }
  const totalpage = await Product.countDocuments(find);
  objectPagination.totalpage = Math.ceil(totalpage / objectPagination.limitItem);

  if (objectPagination.totalpage > 0 && objectPagination.currentPage > objectPagination.totalpage) {
    objectPagination.currentPage = objectPagination.totalpage;
  }

  if (objectPagination.currentPage < 1 || Number.isNaN(objectPagination.currentPage)) {
    objectPagination.currentPage = 1;
  }

  objectPagination.skip =
    (objectPagination.currentPage - 1) * objectPagination.limitItem;
  // end pagination

  const product = await Product.find(find)
    .sort(sort)
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);
  res.render("admin/pages/product/index", {
    PageTitle: "Trang san pham",
    product: product,
    status: status,
    keyword: keyword,
    sort: sortQuery,
    totalProducts: totalProducts,
    activeProduct: activeProduct,
    inactiveProduct: inactiveProduct,
    pagination : objectPagination
  });
};

module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await Product.updateOne({ _id: id }, { active: status });

  req.flash("success", "Status update successful");
  res.redirect("/admin/product");
};
// [delete] /admin/product/delete
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  await Product.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });
  const referer = req.get("referer");
  req.flash("success", "Product deleted successfully");
  res.redirect(referer || "/admin/product");
}

// [patch] /admin/product/change-multi

module.exports.changeMulti = async (req, res) => {
  const type = req.body.bulkAction;
  const ids = req.body.ids ? req.body.ids.split(",") : [];

  if(!type || ids.length === 0) {
    const referer = req.get("referer");
    return res.redirect(referer || "/admin/product");
  }
  switch (type) {
    case "active":
      await Product.updateMany(
        {_id: { $in : ids} },
        {active : true}
      );
      break;
    case "inactive":
      await Product.updateMany(
        {_id: { $in : ids} },
        {active : false}
      );
      break;
    case "delete":
      await Product.updateMany(
        {_id: { $in : ids} },
        { deleted : true,
          deleteAt: new Date()
        }
      );
    case "change-position":
      for(const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Product.updateOne({_id : id}, {position : position});
      }
      break;
  }

  req.flash("success", "Status update successful");

  const referer = req.get("referer");
  res.redirect(referer || "/admin/product");
}
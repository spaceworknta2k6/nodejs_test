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

  const product = await Product.find(find).sort(sort);
  // end submitButton
  res.render("admin/pages/product/index", {
    PageTitle: "Trang san pham",
    product: product,
    status: status,
    keyword: keyword,
    sort: sortQuery,
    totalProducts: totalProducts,
    activeProduct: activeProduct,
    inactiveProduct: inactiveProduct,
  });
};

module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await Product.updateOne({ _id: id }, { active: status });

  res.redirect("/admin/product");
};

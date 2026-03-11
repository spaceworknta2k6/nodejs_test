// [GET] /admin/product
const Product = require("../../models/product.model");
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

  let sort = {};

  switch (sortQuery) {
    case "name-asc":
      sort.title = 1;
      break;
    case "name-desc":
      sort.title = -1;
      break;
    case "price-asc":
      sort.price = 1;
      break;
    case "price-desc":
      sort.price = -1;
      break;
    default:
      sort._id = -1;
      break;
  }

  const product = await Product.find(find).sort();
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

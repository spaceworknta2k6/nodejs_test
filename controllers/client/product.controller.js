const Product = require('../../models/product.model')

// [GET] /product
module.exports.index = async (req, res) => {
  const product = await Product.find({
    active: true
  }).sort({position : "desc"});

  res.render("client/pages/products/index", {
    TitlePage : "Trang san pham",
    products : product
  });
}
const Product = require('../../models/product.model')

const roundCurrency = (value) => {
  return Math.round((Number(value) || 0) * 100) / 100;
};

const formatCurrency = (value) => {
  const roundedValue = roundCurrency(value);
  const hasDecimals = !Number.isInteger(roundedValue);

  return `${new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  }).format(roundedValue)}$`;
};

// [GET] /product
module.exports.index = async (req, res) => {
  const product = await Product.find({
    active: true
  }).sort({position : "desc"});

  const products = product.map((item) => {
    const rawPrice = roundCurrency(item.price);
    const discountPercentage = Number(item.discountPercentage) || 0;
    const hasDiscount = discountPercentage > 0;
    const finalPrice = hasDiscount
      ? roundCurrency(rawPrice * (1 - discountPercentage / 100))
      : rawPrice;
    const savedAmount = hasDiscount
      ? roundCurrency(Math.max(rawPrice - finalPrice, 0))
      : 0;

    return {
      ...item.toObject(),
      rawPrice,
      finalPrice,
      savedAmount,
      hasDiscount,
      formattedRawPrice: formatCurrency(rawPrice),
      formattedFinalPrice: formatCurrency(finalPrice),
      formattedSavedAmount: formatCurrency(savedAmount)
    };
  });

  res.render("client/pages/products/index", {
    TitlePage : "Trang san pham",
    products
  });
}

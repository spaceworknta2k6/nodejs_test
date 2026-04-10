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

const getProductImage = (item) => {
  return (item.images && item.images.length > 0 ? item.images[0] : item.thumbnail) || "https://via.placeholder.com/1200x900?text=No+Image";
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
      imageSrc: getProductImage(item),
      rawPrice,
      finalPrice,
      savedAmount,
      hasDiscount,
      formattedRawPrice: formatCurrency(rawPrice),
      formattedFinalPrice: formatCurrency(finalPrice),
      formattedSavedAmount: formatCurrency(savedAmount)
    };
  });

  const discountedCount = products.filter((item) => item.hasDiscount).length;
  const totalInventoryValue = roundCurrency(
    products.reduce((sum, item) => sum + item.finalPrice, 0)
  );
  const categories = products.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const leadingCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "Curated picks";
  const displayLeadingCategory = /[Ã°áº]/.test(leadingCategory) ? "Uncategorized" : leadingCategory;
  const featuredProduct = products[0] || null;
  const spotlightProducts = products.slice(1, 2);
  const galleryProducts = products.slice(2, 5);
  const detailProducts = products.slice(5, 7);

  res.render("client/pages/products/index", {
    TitlePage : "Products",
    products,
    featuredProduct,
    spotlightProducts,
    galleryProducts,
    detailProducts,
    productStats: {
      totalProducts: products.length,
      discountedCount,
      totalInventoryValue: formatCurrency(totalInventoryValue),
      leadingCategory: displayLeadingCategory
    }
  });
}

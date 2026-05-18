const Product = require("../../models/product.model");

const roundCurrency = (value) => {
  return Math.round((Number(value) || 0) * 100) / 100;
};

const formatCurrency = (value) => {
  const roundedValue = roundCurrency(value);
  const hasDecimals = !Number.isInteger(roundedValue);

  return `${new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(roundedValue)}$`;
};

const getProductImage = (item) => {
  return (
    (item.images && item.images.length > 0 ? item.images[0] : item.thumbnail) ||
    "https://via.placeholder.com/1200x900?text=No+Image"
  );
};

const getProductDetailPath = (item) => {
  return `/products/${item.slug || item._id}`;
};

const mapProductForView = (item) => {
  const rawPrice = roundCurrency(item.price);
  const discountPercentage = Number(item.discountPercentage) || 0;
  const hasDiscount = discountPercentage > 0;
  const finalPrice = hasDiscount
    ? roundCurrency(rawPrice * (1 - discountPercentage / 100))
    : rawPrice;

  return {
    ...item.toObject(),
    imageSrc: getProductImage(item),
    hasDiscount,
    formattedRawPrice: formatCurrency(rawPrice),
    formattedFinalPrice: formatCurrency(finalPrice),
    detailPath: getProductDetailPath(item),
  };
};

// [GET] /
module.exports.index = async (req, res) => {
  try {
    const featuredProducts = await Product.find({
      active: true,
      deleted: false,
      featured: true,
    })
      .sort({ position: "desc", createdAt: -1 })
      .limit(6);

    const mappedFeaturedProducts = featuredProducts.map(mapProductForView);

    res.render("client/pages/home/index", {
      TitlePage: "Home",
      heroProduct: mappedFeaturedProducts[0] || null,
      featuredProducts: mappedFeaturedProducts.slice(1),
    });
  } catch (error) {
    console.error("Home page error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

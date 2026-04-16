const mongoose = require("mongoose");
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

const buildCategoryLabel = (value) => {
  const category = value || "Uncategorized";
  return /[ÃƒÂ°Ã¡Âº]/.test(category) ? "Uncategorized" : category;
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
  const savedAmount = hasDiscount
    ? roundCurrency(Math.max(rawPrice - finalPrice, 0))
    : 0;
  const stock = Math.max(Number(item.stock) || 0, 0);
  const inStock = stock > 0;

  return {
    ...item.toObject(),
    imageSrc: getProductImage(item),
    rawPrice,
    finalPrice,
    savedAmount,
    hasDiscount,
    formattedRawPrice: formatCurrency(rawPrice),
    formattedFinalPrice: formatCurrency(finalPrice),
    formattedSavedAmount: formatCurrency(savedAmount),
    categoryLabel: buildCategoryLabel(item.category),
    detailPath: getProductDetailPath(item),
    stock,
    inStock,
    stockLabel: inStock ? "In stock" : "Out of stock",
  };
};

const getProductStats = async (filter) => {
  const [stats] = await Product.aggregate([
    {
      $match: filter,
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              discountedCount: {
                $sum: {
                  $cond: [
                    {
                      $gt: [
                        {
                          $convert: {
                            input: "$discountPercentage",
                            to: "double",
                            onError: 0,
                            onNull: 0,
                          },
                        },
                        0,
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              totalInventoryValue: {
                $sum: {
                  $multiply: [
                    {
                      $convert: {
                        input: "$price",
                        to: "double",
                        onError: 0,
                        onNull: 0,
                      },
                    },
                    {
                      $subtract: [
                        1,
                        {
                          $divide: [
                            {
                              $convert: {
                                input: "$discountPercentage",
                                to: "double",
                                onError: 0,
                                onNull: 0,
                              },
                            },
                            100,
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
        categories: [
          {
            $group: {
              _id: {
                $ifNull: ["$category", "Uncategorized"],
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1, _id: 1 } },
          { $limit: 1 },
        ],
      },
    },
  ]);

  const summary = stats?.summary?.[0] || {};
  const leadingCategory = buildCategoryLabel(
    stats?.categories?.[0]?._id || "Curated picks",
  );

  return {
    discountedCount: summary.discountedCount || 0,
    totalInventoryValue: roundCurrency(summary.totalInventoryValue || 0),
    leadingCategory,
  };
};

// [GET] /product
module.exports.index = async (req, res) => {
  try {
    const sortName = req.query.sortName || "";
    const category = req.query.category || "";
    const sortPrice = req.query.sortPrice || "";
    const priceRange = req.query.priceRange || "";
    const stock = req.query.stock || "";

    const filter = {
      active: true,
      deleted: false,
    };

    if (category) {
      filter.category = category;
    }

    if (stock === "in-stock") {
      filter.stock = { $gt: 0 };
    } else if (stock === "out-of-stock") {
      filter.stock = { $lte: 0 };
    }

    if (priceRange === "under-500") {
      filter.price = { $lt: 500 };
    } else if (priceRange === "500-1000") {
      filter.price = { $gte: 500, $lte: 1000 };
    } else if (priceRange === "over-1000") {
      filter.price = { $gt: 1000 };
    }

    let sort = { position: "desc", createdAt: -1 };

    if (sortName === "az") {
      sort = { title: 1, createdAt: -1 };
    } else if (sortName === "za") {
      sort = { title: -1, createdAt: -1 };
    } else if (sortPrice === "asc") {
      sort = { price: 1, createdAt: -1 };
    } else if (sortPrice === "desc") {
      sort = { price: -1, createdAt: -1 };
    }

    const baseFilter = {
      active: true,
      deleted: false,
    };

    const categoryValues = await Product.distinct("category", {
      ...baseFilter,
      category: { $nin: [null, ""] },
    });
    const categories = categoryValues.sort((left, right) =>
      String(left).localeCompare(String(right), "en", { sensitivity: "base" }),
    );

    const queryParams = new URLSearchParams();
    if (sortName) {
      queryParams.set("sortName", sortName);
    }
    if (category) {
      queryParams.set("category", category);
    }
    if (sortPrice) {
      queryParams.set("sortPrice", sortPrice);
    }
    if (priceRange) {
      queryParams.set("priceRange", priceRange);
    }
    if (stock) {
      queryParams.set("stock", stock);
    }

    const queryString = queryParams.toString();
    const paginationQuerySuffix = queryString ? `&${queryString}` : "";
    const pageSize = 9;
    const requestedPage = parseInt(req.query.page, 10);
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(totalProducts / pageSize), 1);
    const currentPage =
      !Number.isNaN(requestedPage) && requestedPage > 0
        ? Math.min(requestedPage, totalPages)
        : 1;
    const skip = (currentPage - 1) * pageSize;

    const [featuredRawProducts, paginatedRawProducts, stats] =
      await Promise.all([
        Product.find(baseFilter).sort({ position: "desc", createdAt: -1 }).limit(7),
        Product.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(pageSize),
        getProductStats(filter),
      ]);

    const featuredProducts = featuredRawProducts.map(mapProductForView);
    const products = paginatedRawProducts.map(mapProductForView);
    const featuredProduct = featuredProducts[0] || null;
    const spotlightProducts = featuredProducts.slice(1, 2);
    const galleryProducts = featuredProducts.slice(2, 5);
    const detailProducts = featuredProducts.slice(5, 7);
    const paginationStart = Math.max(currentPage - 2, 1);
    const paginationEnd = Math.min(paginationStart + 4, totalPages);
    const adjustedStart = Math.max(paginationEnd - 4, 1);
    const pageNumbers = [];

    for (let page = adjustedStart; page <= paginationEnd; page += 1) {
      pageNumbers.push(page);
    }

    res.render("client/pages/products/index", {
      TitlePage: "Products",
      products,
      categories,
      featuredProduct,
      spotlightProducts,
      galleryProducts,
      detailProducts,
      selectedFilters: {
        sortName,
        category,
        sortPrice,
        priceRange,
        stock,
      },
      queryString,
      paginationQuerySuffix,
      productStats: {
        totalProducts,
        discountedCount: stats.discountedCount,
        totalInventoryValue: formatCurrency(stats.totalInventoryValue),
        leadingCategory: stats.leadingCategory,
      },
      pagination: {
        currentPage,
        totalPages,
        totalProducts,
        pageNumbers,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages,
        prevPage: currentPage - 1,
        nextPage: currentPage + 1,
        startItem: totalProducts === 0 ? 0 : skip + 1,
        endItem: Math.min(skip + products.length, totalProducts),
      },
    });
  } catch (error) {
    console.error("Products page error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// [GET] /products/:slug
module.exports.detail = async (req, res) => {
  const slugOrId = req.params.slug;
  const baseFilter = {
    active: true,
    deleted: false,
  };
  const lookup = mongoose.Types.ObjectId.isValid(slugOrId)
    ? {
        ...baseFilter,
        $or: [{ slug: slugOrId }, { _id: slugOrId }],
      }
    : {
        ...baseFilter,
        slug: slugOrId,
      };

  const productRaw = await Product.findOne(lookup);

  if (!productRaw) {
    return res.status(404).render("client/pages/products/detail", {
      TitlePage: "Product Detail",
      product: null,
      relatedProducts: [],
    });
  }

  const relatedRawProducts = await Product.find({
    _id: { $ne: productRaw._id },
    active: true,
    deleted: false,
  })
    .sort({ position: "desc", createdAt: -1 })
    .limit(3);

  const product = mapProductForView(productRaw);
  const gallery =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.imageSrc];

  res.render("client/pages/products/detail", {
    TitlePage: product.title || "Product Detail",
    product: {
      ...product,
      gallery,
    },
    relatedProducts: relatedRawProducts.map(mapProductForView),
  });
};

const mongoose = require('mongoose');
const Product = require('../../models/product.model');

const roundCurrency = (value) => {
  return Math.round((Number(value) || 0) * 100) / 100;
};

const formatCurrency = (value) => {
  const roundedValue = roundCurrency(value);
  const hasDecimals = !Number.isInteger(roundedValue);

  return `${new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  }).format(roundedValue)}$`;
};

const getProductImage = (item) => {
  return (item.images && item.images.length > 0 ? item.images[0] : item.thumbnail) || 'https://via.placeholder.com/1200x900?text=No+Image';
};

const buildCategoryLabel = (value) => {
  const category = value || 'Uncategorized';
  return /[ÃƒÂ°Ã¡Âº]/.test(category) ? 'Uncategorized' : category;
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
    detailPath: getProductDetailPath(item)
  };
};

const getProductStats = async (filter) => {
  const [stats] = await Product.aggregate([
    {
      $match: filter
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              discountedCount: {
                $sum: {
                  $cond: [{ $gt: [{ $ifNull: ['$discountPercentage', 0] }, 0] }, 1, 0]
                }
              },
              totalInventoryValue: {
                $sum: {
                  $multiply: [
                    { $ifNull: ['$price', 0] },
                    {
                      $subtract: [
                        1,
                        {
                          $divide: [{ $ifNull: ['$discountPercentage', 0] }, 100]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          }
        ],
        categories: [
          {
            $group: {
              _id: {
                $ifNull: ['$category', 'Uncategorized']
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1, _id: 1 } },
          { $limit: 1 }
        ]
      }
    }
  ]);

  const summary = stats?.summary?.[0] || {};
  const leadingCategory = buildCategoryLabel(stats?.categories?.[0]?._id || 'Curated picks');

  return {
    discountedCount: summary.discountedCount || 0,
    totalInventoryValue: roundCurrency(summary.totalInventoryValue || 0),
    leadingCategory
  };
};

// [GET] /product
module.exports.index = async (req, res) => {
  const filter = {
    active: true,
    deleted: false
  };
  const pageSize = 9;
  const requestedPage = parseInt(req.query.page, 10);
  const totalProducts = await Product.countDocuments(filter);
  const totalPages = Math.max(Math.ceil(totalProducts / pageSize), 1);
  const currentPage = !Number.isNaN(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, totalPages)
    : 1;
  const skip = (currentPage - 1) * pageSize;

  const [featuredRawProducts, paginatedRawProducts, stats] = await Promise.all([
    Product.find(filter).sort({ position: 'desc', createdAt: -1 }).limit(7),
    Product.find(filter).sort({ position: 'desc', createdAt: -1 }).skip(skip).limit(pageSize),
    getProductStats(filter)
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

  res.render('client/pages/products/index', {
    TitlePage: 'Products',
    products,
    featuredProduct,
    spotlightProducts,
    galleryProducts,
    detailProducts,
    productStats: {
      totalProducts,
      discountedCount: stats.discountedCount,
      totalInventoryValue: formatCurrency(stats.totalInventoryValue),
      leadingCategory: stats.leadingCategory
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
      endItem: Math.min(skip + products.length, totalProducts)
    }
  });
};

// [GET] /products/:slug
module.exports.detail = async (req, res) => {
  const slugOrId = req.params.slug;
  const baseFilter = {
    active: true,
    deleted: false
  };
  const lookup = mongoose.Types.ObjectId.isValid(slugOrId)
    ? {
        ...baseFilter,
        $or: [
          { slug: slugOrId },
          { _id: slugOrId }
        ]
      }
    : {
        ...baseFilter,
        slug: slugOrId
      };

  const productRaw = await Product.findOne(lookup);

  if (!productRaw) {
    return res.status(404).render('client/pages/products/detail', {
      TitlePage: 'Product Detail',
      product: null,
      relatedProducts: []
    });
  }

  const relatedRawProducts = await Product.find({
    _id: { $ne: productRaw._id },
    active: true,
    deleted: false
  })
    .sort({ position: 'desc', createdAt: -1 })
    .limit(3);

  const product = mapProductForView(productRaw);
  const gallery = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.imageSrc];

  res.render('client/pages/products/detail', {
    TitlePage: product.title || 'Product Detail',
    product: {
      ...product,
      gallery
    },
    relatedProducts: relatedRawProducts.map(mapProductForView)
  });
};

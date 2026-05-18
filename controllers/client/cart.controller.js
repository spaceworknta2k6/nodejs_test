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

const getProductPrice = (item) => {
  const rawPrice = roundCurrency(item.price);
  const discountPercentage = Number(item.discountPercentage) || 0;

  return discountPercentage > 0
    ? roundCurrency(rawPrice * (1 - discountPercentage / 100))
    : rawPrice;
};

const getCart = (req) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }

  return req.session.cart;
};

const getCartDetail = async (req) => {
  const cart = getCart(req);
  const productIds = cart.map((item) => item.product_id);
  const products = await Product.find({
    _id: { $in: productIds },
    deleted: false,
    active: true,
  });
  const productMap = new Map(products.map((item) => [String(item._id), item]));

  const items = cart
    .map((cartItem) => {
      const product = productMap.get(String(cartItem.product_id));

      if (!product) {
        return null;
      }

      const quantity = Math.max(parseInt(cartItem.quantity, 10) || 1, 1);
      const unitPrice = getProductPrice(product);
      const totalPrice = roundCurrency(unitPrice * quantity);

      return {
        product_id: String(product._id),
        title: product.title,
        slug: product.slug,
        imageSrc: getProductImage(product),
        quantity,
        stock: Math.max(Number(product.stock) || 0, 0),
        unitPrice,
        totalPrice,
        formattedUnitPrice: formatCurrency(unitPrice),
        formattedTotalPrice: formatCurrency(totalPrice),
        detailPath: `/products/${product.slug || product._id}`,
      };
    })
    .filter(Boolean);

  const summary = items.reduce(
    (result, item) => {
      result.totalQuantity += item.quantity;
      result.totalPrice = roundCurrency(result.totalPrice + item.totalPrice);
      return result;
    },
    {
      totalQuantity: 0,
      totalPrice: 0,
    },
  );

  return {
    items,
    summary: {
      ...summary,
      formattedTotalPrice: formatCurrency(summary.totalPrice),
    },
  };
};

module.exports.index = async (req, res) => {
  const cartDetail = await getCartDetail(req);

  res.render("client/pages/cart/index", {
    TitlePage: "Giỏ hàng",
    cart: cartDetail,
  });
};

module.exports.addPost = async (req, res) => {
  const productId = req.params.productId;
  const quantity = Math.max(parseInt(req.body.quantity, 10) || 1, 1);
  const product = await Product.findOne({
    _id: productId,
    active: true,
    deleted: false,
  });

  if (!product) {
    return res.redirect("/products");
  }

  const stock = Math.max(Number(product.stock) || 0, 0);

  if (stock <= 0) {
    return res.redirect(req.get("referer") || "/products");
  }

  const cart = getCart(req);
  const item = cart.find((cartItem) => String(cartItem.product_id) === productId);

  if (item) {
    item.quantity = Math.min((parseInt(item.quantity, 10) || 0) + quantity, stock);
  } else {
    cart.push({
      product_id: productId,
      quantity: Math.min(quantity, stock),
    });
  }

  req.session.cart = cart;
  res.redirect(req.get("referer") || "/cart");
};

module.exports.updatePost = async (req, res) => {
  const productId = req.params.productId;
  const quantity = Math.max(parseInt(req.body.quantity, 10) || 1, 1);
  const product = await Product.findOne({
    _id: productId,
    active: true,
    deleted: false,
  });

  if (!product) {
    req.session.cart = getCart(req).filter(
      (item) => String(item.product_id) !== productId,
    );
    return res.redirect("/cart");
  }

  const stock = Math.max(Number(product.stock) || 0, 0);
  const cart = getCart(req);
  const item = cart.find((cartItem) => String(cartItem.product_id) === productId);

  if (item) {
    item.quantity = Math.min(quantity, Math.max(stock, 1));
  }

  req.session.cart = cart;
  res.redirect("/cart");
};

module.exports.removePost = (req, res) => {
  const productId = req.params.productId;
  req.session.cart = getCart(req).filter(
    (item) => String(item.product_id) !== productId,
  );

  res.redirect("/cart");
};

module.exports.clearPost = (req, res) => {
  req.session.cart = [];
  res.redirect("/cart");
};

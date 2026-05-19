const Product = require("../../models/product.model");
const Order = require("../../models/order.model");

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
    }
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

  if (!cartDetail.items.length) {
    return res.redirect("/cart");
  }

  res.render("client/pages/checkout/index", {
    TitlePage: "Thanh toán đơn hàng",
    cart: cartDetail,
  });
};

module.exports.order = async (req, res) => {
  const { fullName, phone, address } = req.body;

  if (!fullName || !phone || !address) {
    return res.redirect("/checkout");
  }

  const cartDetail = await getCartDetail(req);

  if (!cartDetail.items.length) {
    return res.redirect("/cart");
  }

  let orderCode;
  let isUnique = false;
  while (!isUnique) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    orderCode = `NTA-${code}`;
    const existingOrder = await Order.findOne({ code: orderCode });
    if (!existingOrder) {
      isUnique = true;
    }
  }

  const orderInfo = {
    code: orderCode,
    userInfo: {
      fullName,
      phone,
      address,
    },
    products: cartDetail.items.map((item) => ({
      product_id: item.product_id,
      price: item.unitPrice,
      quantity: item.quantity,
    })),
  };

  const orderObj = new Order(orderInfo);
  await orderObj.save();

  // Update product stock
  for (const item of cartDetail.items) {
    await Product.updateOne(
      { _id: item.product_id },
      { $inc: { stock: -item.quantity } }
    );
  }

  // Clear cart
  req.session.cart = [];

  res.redirect(`/checkout/success/${orderObj._id}`);
};

module.exports.success = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.redirect("/");
    }

    const productIds = order.products.map((item) => item.product_id);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((item) => [String(item._id), item]));

    const orderProducts = order.products.map((item) => {
      const product = productMap.get(item.product_id);
      const title = product ? product.title : "Sản phẩm không tồn tại hoặc đã bị xóa";
      const slug = product ? product.slug : "";
      const imageSrc = product ? getProductImage(product) : "https://via.placeholder.com/1200x900?text=No+Image";
      const totalPrice = roundCurrency(item.price * item.quantity);

      return {
        product_id: item.product_id,
        title,
        slug,
        imageSrc,
        quantity: item.quantity,
        price: item.price,
        totalPrice,
        formattedPrice: formatCurrency(item.price),
        formattedTotalPrice: formatCurrency(totalPrice),
        detailPath: slug ? `/products/${slug}` : "#",
      };
    });

    const totalQuantity = orderProducts.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = orderProducts.reduce(
      (sum, item) => roundCurrency(sum + item.totalPrice),
      0
    );

    res.render("client/pages/checkout/success", {
      TitlePage: "Đặt hàng thành công",
      order,
      products: orderProducts,
      summary: {
        totalQuantity,
        totalPrice,
        formattedTotalPrice: formatCurrency(totalPrice),
      },
    });
  } catch (error) {
    console.error("Success checkout page error:", error);
    res.redirect("/");
  }
};

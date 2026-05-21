const ProductRoute = require("./product.route");
const HomeRoute = require("./home.route");
const CartRoute = require("./cart.route");
const CheckoutRoute = require("./checkout.route");
const UserRoute = require("./user.route");
const authMiddleware = require("../../middlewares/client/auth.middleware");
const ChatRoute = require("./chat.route");
const usersRoute = require("./users.route");
module.exports = (app) => {
  app.use("/user", UserRoute);
  app.use(
    ["/", "/home", "/products", "/cart", "/checkout"],
    authMiddleware.requireAuth,
  );

  app.use("/", HomeRoute);
  app.use("/cart", CartRoute);
  app.use("/checkout", CheckoutRoute);
  app.use("/products", ProductRoute);
  app.use("/chat", authMiddleware.requireAuth, ChatRoute);
  app.use("/users", authMiddleware.requireAuth, usersRoute);
};

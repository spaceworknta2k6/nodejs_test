const ProductRoute = require('./product.route')
const HomeRoute = require('./home.route')
const CartRoute = require("./cart.route")
const CheckoutRoute = require("./checkout.route")
const UserRoute = require("./user.route")
const authMiddleware = require("../../middlewares/client/auth.middleware")

module.exports = (app) => {
    app.use("/user", UserRoute)
    app.use(authMiddleware.requireAuth)

    app.use("/", HomeRoute)
    app.use("/cart", CartRoute)
    app.use("/checkout", CheckoutRoute)
    app.use("/products", ProductRoute)
}

const ProductRoute = require('./product.route')
const HomeRoute = require('./home.route')
const CartRoute = require("./cart.route")
module.exports = (app) => {
    app.use("/", HomeRoute)
    app.use("/cart", CartRoute)
    
    app.use("/products", ProductRoute)
}

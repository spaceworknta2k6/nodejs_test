const DashboardRoute = require('./dashboard.routes')
const ProductRouter = require('./product.routes')
const SystemConfig = require('../../config/system')

module.exports = (app) => {
    const PathAdmin = SystemConfig.prefixAdmin
    app.use(PathAdmin + "/dashboard", DashboardRoute)
    app.use(PathAdmin + "/product", ProductRouter)
}

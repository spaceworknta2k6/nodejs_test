const DashboardRoute = require('./dashboard.routes')
const ProductRouter = require('./product.routes')
const SystemConfig = require('../../config/system')
const RoleRouter = require("./role.routes")
const AccountRouter = require("./account.routes")
const AuthRouter = require("./auth.routes")
const AuthMiddleware = require("../../middlewares/admin/auth.middleware")
module.exports = (app) => {
    const PathAdmin = SystemConfig.prefixAdmin
    app.use(PathAdmin + "/dashboard", AuthMiddleware.requireAuth, DashboardRoute)
    app.use(PathAdmin + "/product", AuthMiddleware.requireAuth, ProductRouter)
    app.use(PathAdmin + "/roles", AuthMiddleware.requireAuth, RoleRouter)
    app.use(PathAdmin + "/accounts", AuthMiddleware.requireAuth, AccountRouter)
    app.use(PathAdmin + "/auth", AuthRouter)

    // Trang lỗi phân quyền
    app.get(PathAdmin + "/403", AuthMiddleware.requireAuth, (req, res) => {
        res.render("admin/pages/errors/403", {
            PageTitle: "Không có quyền truy cập"
        });
    });
}


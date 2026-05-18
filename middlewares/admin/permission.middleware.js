/**
 * Middleware kiểm tra quyền hạn của người dùng
 * @param {string} permissionKey - key quyền cần kiểm tra (vd: "products_view")
 */
module.exports.checkPermission = (permissionKey) => {
    return (req, res, next) => {
        const role = res.locals.role;

        // Nếu không có role hoặc không có quyền cần thiết
        if (!role || !Array.isArray(role.permission) || !role.permission.includes(permissionKey)) {
            // Nếu là AJAX / API request → trả JSON lỗi
            const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));
            if (isAjax) {
                return res.status(403).json({
                    code: 403,
                    message: "Bạn không có quyền thực hiện hành động này"
                });
            }
            // Nếu là browser request → redirect trang 403
            return res.redirect('/admin/403');
        }

        next();
    };
};

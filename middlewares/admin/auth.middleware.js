const systemConfig = require("../../config/system")
const Account = require("../../models/account.model")
const Role = require("../../models/roles.model")
module.exports.requireAuth = async (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`)
        return
    }
    const user = await Account.findOne({ token }).select("-password")
    if (!user) {
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`)
        return
    } else {
        const role = await Role.findOne({ _id: user.role_id })
        const safeRole = role || { permission: [] };
        user.role = safeRole;
        res.locals.user = user;
        res.locals.role = safeRole;
        next();
    }
}
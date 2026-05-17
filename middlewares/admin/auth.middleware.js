const systemConfig = require("../../config/system")
const Account = require("../../models/account.model")
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
    }
    next();
}
// [GET] /admin/product
const Product = require('../../models/product.model')
module.exports.products = async (req, res) => {
    const product = await Product.find({
        deleted : false
    })
    
    res.render('admin/pages/product/index', {
        PageTitle : "Trang san pham",
        product : product
    })
}
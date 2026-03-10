// [GET] /admin/product
const Product = require('../../models/product.model')
module.exports.products = async (req, res) => {

    let find = {
        deleted : false
    }
    if(req.query.status === "active") {
        find.active = true
    }
    if(req.query.status === "inactive") {
        find.active = false
    }
    const product = await Product.find(find)
    
    res.render('admin/pages/product/index', {
        PageTitle : "Trang san pham",
        product : product,
        status : req.query.status
    })
}
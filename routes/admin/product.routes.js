const express = require('express')
const router = express.Router()

const ProductController = require('../../controllers/admin/product.controller')

router.get("/", ProductController.products)

module.exports = router
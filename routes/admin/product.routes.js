const express = require('express')
const router = express.Router()

const ProductController = require('../../controllers/admin/product.controller')

router.get("/", ProductController.products)

router.patch("/changeStatus/:id/:status", ProductController.changeStatus)

module.exports = router
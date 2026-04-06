const express = require('express')
const router = express.Router()

const ProductController = require('../../controllers/admin/product.controller')

router.get("/", ProductController.products)

router.patch("/changeStatus/:id/:status", ProductController.changeStatus)

router.delete("/delete/:id", ProductController.deleteItem)

router.patch("/change-multi", ProductController.changeMulti)
module.exports = router
const express = require('express')

const router = express.Router()
const ProductController = require('../../controllers/client/product.controller')

router.get('/', ProductController.index);
router.get('/:slug', ProductController.detail);

module.exports = router

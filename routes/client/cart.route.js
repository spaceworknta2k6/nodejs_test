const express = require("express");

const router = express.Router();
const CartController = require("../../controllers/client/cart.controller");

router.get("/", CartController.index);
router.post("/add/:productId", CartController.addPost);
router.post("/update/:productId", CartController.updatePost);
router.post("/remove/:productId", CartController.removePost);
router.post("/clear", CartController.clearPost);

module.exports = router;

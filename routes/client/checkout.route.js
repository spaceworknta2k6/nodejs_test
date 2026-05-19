const express = require("express");
const router = express.Router();
const CheckoutController = require("../../controllers/client/checkout.controller");

router.get("/", CheckoutController.index);
router.post("/order", CheckoutController.order);
router.get("/success/:orderId", CheckoutController.success);

module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../../helper/storageMulter")
const upload = multer({ storage: storage() });
const ProductController = require("../../controllers/admin/product.controller");
const validate = require("../../validates/admin/product.validate");

router.get("/", ProductController.products);

router.patch("/changeStatus/:id/:status", ProductController.changeStatus);

router.delete("/delete/:id", ProductController.deleteItem);

router.patch("/change-multi", ProductController.changeMulti);
router.get("/detail/:id", ProductController.detail);

router.get("/create", ProductController.create);
router.post(
  "/create",
  upload.array("images", 5),
  validate.createPost,
  ProductController.createPost,
);

router.patch(
  "/edit/:id",
  upload.array("images", 5),
  ProductController.editPatch,
);
router.get("/edit/:id", ProductController.edit);
module.exports = router;

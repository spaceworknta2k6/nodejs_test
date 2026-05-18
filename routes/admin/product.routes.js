const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../../helper/storageMulter")
const upload = multer({ storage: storage() });
const ProductController = require("../../controllers/admin/product.controller");
const validate = require("../../validates/admin/product.validate");
const { checkPermission } = require("../../middlewares/admin/permission.middleware");

// Xem danh sách
router.get("/", checkPermission("products_view"), ProductController.products);

// Xem chi tiết
router.get("/detail/:id", checkPermission("products_view"), ProductController.detail);

// Thêm mới
router.get("/create", checkPermission("products_create"), ProductController.create);
router.post("/create", checkPermission("products_create"), upload.array("images", 5), validate.createPost, ProductController.createPost);

// Chỉnh sửa
router.get("/edit/:id", checkPermission("products_edit"), ProductController.edit);
router.patch("/edit/:id", checkPermission("products_edit"), upload.array("images", 5), ProductController.editPatch);

// Đổi trạng thái đơn
router.patch("/changeStatus/:id/:status", checkPermission("products_edit"), ProductController.changeStatus);

// Thao tác hàng loạt
router.patch("/change-multi", checkPermission("products_edit"), ProductController.changeMulti);

// Xóa
router.delete("/delete/:id", checkPermission("products_delete"), ProductController.deleteItem);

module.exports = router;

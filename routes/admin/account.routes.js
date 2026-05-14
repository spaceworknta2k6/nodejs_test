const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../../helper/storageMulter")
const upload = multer({ storage: storage() });
const AccountController = require("../../controllers/admin/account.controller")
const validate = require("../../validates/admin/account.validate");

router.get("/", AccountController.index);
router.get("/create", AccountController.create);
router.post(
    "/create",
    upload.single("avatar"),
    validate.createPost,
    AccountController.createPost
);

router.get("/edit/:id", AccountController.edit);
router.patch("/edit/:id",
    upload.single("avatar"),
    validate.editPatch,
    AccountController.editPatch
)

router.patch("/delete/:id", AccountController.deleteAccount);
module.exports = router;
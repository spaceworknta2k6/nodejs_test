const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../../helper/storageMulter");
const upload = multer({ storage: storage() });
const myaccountController = require("../../controllers/admin/my-account.controller")
const validate = require("../../validates/admin/account.validate");

router.get("/", myaccountController.index);
router.get("/edit/:id", myaccountController.edit);
router.patch(
    "/edit/:id",
    upload.single("avatar"),
    validate.editPatch,
    myaccountController.editPatch
);

module.exports = router;

const express = require("express");
const multer = require("multer");

const router = express.Router();
const UserController = require("../../controllers/client/user.controller");
const validateUser = require("../../validates/client/user.validate");
const storage = require("../../helper/storageMulter");
const upload = multer({ storage: storage() });

router.get("/register", UserController.register);
router.post("/register", validateUser.register, UserController.registerPost);
router.get("/login", UserController.login);
router.post("/login", validateUser.login, UserController.loginPost);
router.get("/profile", UserController.profile);
router.get("/profile/edit", UserController.edit);
router.post("/profile/edit", upload.single("avatar"), UserController.editPost);
router.get("/profile/password", UserController.changePassword);
router.post("/profile/password", UserController.changePasswordPost);
router.get("/logout", UserController.logout);

module.exports = router;

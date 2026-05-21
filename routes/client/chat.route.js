const express = require("express");
const multer = require("multer");
const router = express.Router();
const chatController = require("../../controllers/client/chat.controller");
const storage = require("../../helper/storageMulter");
const upload = multer({ storage: storage() });

router.get("/", chatController.index)
router.post("/upload", upload.array("images", 10), chatController.upload)

module.exports = router
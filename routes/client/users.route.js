const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/client/users.controller");

router.get("/notFriend", usersController.notFriend);

module.exports = router;

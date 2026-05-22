const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/client/users.controller");

router.get("/notFriend", usersController.notFriend);
router.get("/accept", usersController.accept);
router.get("/request", usersController.request);
router.get("/friends", usersController.friends);
module.exports = router;

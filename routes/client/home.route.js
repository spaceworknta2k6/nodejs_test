const express = require('express')

const router = express.Router()
const HomeController = require('../../controllers/client/home.controller')


router.get("/", HomeController.index);

module.exports = router
const express = require('express')
const router = express.Router()

const DashboardController = require('../../controllers/admin/dashboard.controller')

router.get('/', DashboardController.dashboard)

module.exports = router
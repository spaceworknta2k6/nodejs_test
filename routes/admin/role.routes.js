const express = require('express')
const router = express.Router()

const Controller = require('../../controllers/admin/role.controller')

router.get('/', Controller.index)
router.get('/create', Controller.create)

router.post('/create', Controller.createPost)

router.get('/edit/:id', Controller.edit)
router.patch('/edit/:id', Controller.editPatch)

router.get('/permission', Controller.permission)
router.patch('/permission', Controller.permissionPatch)

module.exports = router
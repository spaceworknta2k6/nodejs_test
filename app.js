const express = require('express')
const app = express()

require("dotenv").config()

app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static('public'))

const database = require('./config/database')

const port = process.env.PORT
// app.use(express.static('public'))
const Router = require('./routes/client/index.route')


Router(app)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
const express = require('express')
const app = express()

require("dotenv").config()

app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static('public'))

const database = require('./config/database')
database.connect();

const port = process.env.PORT
// app.use(express.static('public'))
const RouterClient = require('./routes/client/index.route')
const RouterAdmin = require('./routes/admin/index.routes')

const SystemConfig = require('./config/system')

// local variable
app.locals.PrefixAdmin = SystemConfig.prefixAdmin


RouterAdmin(app)
RouterClient(app)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
const express = require('express')
const app = express()
const methodOverride = require('method-override')
const flash = require('express-flash')
const cookieParser = require("cookie-parser")
const session = require("express-session")

require("dotenv").config()

app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }));

// flash
app.use(cookieParser('keyboard cat'));
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());
// end flash
app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static('public'))

const database = require('./config/database')
database.connect();

const port = process.env.PORT

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
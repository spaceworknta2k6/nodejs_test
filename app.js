const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const moment = require("moment");
require("dotenv").config();

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

// flash
const sessionSecret = process.env.SESSION_SECRET || "keyboard cat";

app.use(cookieParser(sessionSecret));
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  }),
);
app.use(flash());
// end flash
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");
app.use(express.static(`${__dirname}/public`));

const database = require("./config/database");
database.connect().catch((error) => {
  console.error("Initial database connection failed:", error);
});
const User = require("./models/user.model");

const port = process.env.PORT;

const RouterClient = require("./routes/client/index.route");
const RouterAdmin = require("./routes/admin/index.routes");

const SystemConfig = require("./config/system");

// local variable
app.locals.PrefixAdmin = SystemConfig.prefixAdmin;
app.locals.moment = moment;

app.use((req, res, next) => {
  const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
  res.locals.cartQuantity = cart.reduce(
    (total, item) => total + (parseInt(item.quantity, 10) || 0),
    0,
  );
  next();
});

app.use(async (req, res, next) => {
  const token = req.cookies.userToken;
  res.locals.currentUser = null;

  if (!token) {
    return next();
  }

  try {
    const user = await User.findOne({
      token,
      deleted: false,
      status: "active",
    }).select("-password");

    if (!user) {
      res.clearCookie("userToken");
      return next();
    }

    res.locals.currentUser = user;
    next();
  } catch (error) {
    console.error("Client user middleware error:", error);
    next();
  }
});
// tinymce
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce")),
);
// end tinymce

app.use(async (req, res, next) => {
  try {
    await database.connect();
    next();
  } catch (error) {
    console.error("Database middleware error:", error);
    res.status(500).send("Database connection error");
  }
});

RouterAdmin(app);
RouterClient(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

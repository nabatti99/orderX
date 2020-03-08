require("dotenv").config();
const express = require("express");
const bodyPaser = require("body-parser");
const cookieParser = require("cookie-parser");

const HomeRouter = require("./routers/home.router");
const AuthenticationRouter = require("./routers/authentication.router");
const GuessRouter = require("./routers/guess.router");
const HelperRouter = require("./routers/helper.router");
const ItemRouter = require("./routers/item.router");

const app = express();
const port = process.env.PORT;

app.set("views", "views");
app.set("view engine", "pug");

app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded());
app.use(cookieParser(process.env.COOKIE_CODE));
app.use(express.static("public"));

app.use("/", HomeRouter);
app.use("/auth", AuthenticationRouter);
app.use("/guess", GuessRouter);
app.use("/helper", HelperRouter);
app.use("/item", ItemRouter);

app.listen(port, () => {
  console.log("Server on port " + port);
});
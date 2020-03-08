const express = require("express");
const HomeController = require("../controllers/home.controller");
const AuthenticationController = require("../controllers/authentication.controller");

const Home = express.Router();
Home.use(AuthenticationController.detectUser);

Home.get("/", HomeController.get);

module.exports = Home;
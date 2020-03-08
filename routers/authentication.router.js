const express = require("express");
const AuthenticationController = require("../controllers/authentication.controller");

const Authentication = express.Router();

Authentication.get("/", AuthenticationController.get);

Authentication.post("/", AuthenticationController.post);

Authentication.get("/register", AuthenticationController.getRegister);

Authentication.post("/register", AuthenticationController.postRegister);

Authentication.post("/log-out", AuthenticationController.checkCookie, AuthenticationController.clearCookie);

Authentication.get("/verify/:id", AuthenticationController.verify);

module.exports = Authentication;
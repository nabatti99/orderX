const express = require("express");
const HelperController = require("../controllers/helper.controller");
const AuthenticationController = require("../controllers/authentication.controller");

const Helper = express.Router();

Helper.use(AuthenticationController.checkCookie);

Helper.get("/", HelperController.get);

Helper.get("/:id", HelperController.getItem);

Helper.post("/:id", HelperController.postItem);

module.exports = Helper;
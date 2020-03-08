const express = require("express");
const ItemController = require("../controllers/item.controller");
const AuthenticationController = require("../controllers/authentication.controller");

const Item = express.Router();

Item.use(AuthenticationController.checkCookie);

Item.post("/", ItemController.makeOrderPost);

module.exports = Item;
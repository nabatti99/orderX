const express = require("express");
const GuessController = require("../controllers/guess.controller");
const AuthenticationController = require("../controllers/authentication.controller");

const Guess = express.Router();

Guess.use(AuthenticationController.checkCookie);

Guess.get("/", GuessController.get);

Guess.post("/", GuessController.post);

Guess.get("/:id", GuessController.getItem);

Guess.post("/:id", GuessController.postItem);

// Error (Why?) If I user this endpoint to post Make-order page, it error
// Guess.post("/makeOrder", GuessController.makeOrderPost);

module.exports = Guess;
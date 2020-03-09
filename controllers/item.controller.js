const User = require("../models/user.model");
const nodemailer = require("../controllers/nodemailer.controller");

// render make-order page
module.exports.makeOrderPost = async function (request, response, next) {
  checkFlag = true;

  // default class of HLTM fields
  let classInput = await {
    name: "form-control is-valid",
    cost: "form-control is-valid",
    address: "form-control is-valid",
    helper: "form-control is-valid",
  }

  await validation(request);

  // check validation
  async function validation(request) {
    for (key in classInput) {
      if (!request.body[key]) {
        classInput[key] = classInput[key].replace("is-valid", "is-invalid");
        checkFlag = false;
      }
    }
  }

  // If check is false -> rerender page
  if(!checkFlag) {
    const helpers = await User.Helper
      .find();

    response.render("make-order.pug", {
      data: request.body,
      classInput: classInput,
      helpers: helpers,
      toastTitle: "Error",
      toastBody: "Not enough informations."
    });
    return;
  }

  const helper = await User.Helper
    .findById(request.body.helper)
    .populate("itemsReceived")
    .exec();

  const guess = response.locals.user;

  // create new item
  const newItem = new User.Item({
    name: request.body.name,
    cost: request.body.cost,
    address: request.body.address,
    helper: helper._id,
    guess: guess._id,
    isPayed: false,
    isTrue: false
  });

  // set item for "Helper" and "Guess"
  guess.itemsOrdered.push(newItem._id);
  helper.itemsReceived.push(newItem._id);

  await newItem.save();
  await guess.save();
  helper.save();

  // Set mail reminder
  nodemailer.setRemind(guess, newItem, helper);

  response.redirect("/guess");
}
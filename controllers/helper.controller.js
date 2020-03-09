const User = require("../models/user.model");
const nodemailer = require("../controllers/nodemailer.controller");

// render "Helper" user page
module.exports.get = async function (request, response, next) {
  // use locals varible have been set on previous middware
  const user = response.locals.user;
  const sessionId = response.locals.sessionId;

  // If not a "Helper" user -> redirect to "User" page
  if (sessionId.type != "Helper") {
    response.redirect("/guess");
    return;
  }

  // find item that "Guess" user hasn't repayed
  const itemsOrdered = await User.Item
    .find({
      helper: user._id,
      isPayed: false,
      isTrue: false
    })
    .populate("guess")
    .populate("helper")
    .sort({
      createdAt: -1
    })
    .exec();

  // find item that "Guess" user has repayed
  const itemsPayed = await User.Item
    .find({
      helper: user._id,
      isPayed: true,
      isTrue: false
    })
    .populate("guess")
    .populate("helper")
    .sort({
      createdAt: -1
    })
    .exec();

  // find item that "Guess" user has repayed and "Helper" user has confirm it
  const itemsCompleted = await User.Item
    .find({
      helper: user._id,
      isPayed: true,
      isTrue: true
    })
    .populate("guess")
    .populate("helper")
    .sort({
      createdAt: -1
    })
    .exec();

  response.render("helper.pug", {
    user: user,
    itemsOrdered: itemsOrdered,
    itemsPayed: itemsPayed,
    itemsCompleted: itemsCompleted,
    toastTitle: "Admin",
    toastBody: `Welcome ${user.name}`
  });

  return;
}

// render view item page
module.exports.getItem = async function (request, response, next) {
  let itemId = request.params.id;
  const item = await User.Item
    .findById(itemId)
    .populate("guess")
    .populate("helper")
    .exec();

  const stateClasses = [
    "text-warning",
    "text-info",
    "text-success",
  ];

  const buttonClasses = [
    "btn-primary",
    "btn-success disabled"
  ];

  const buttonMessages = [
    "Waiting for payment...",
    "Accept request",
    "Completed"
  ]

  response.render("item-helper.pug", {
    itemId: itemId,
    item: item,
    stateClass: stateClasses[item.state.code],
    buttonClass: item.state.code == 1 ? buttonClasses[0] : buttonClasses[1],
    buttonMessage: buttonMessages[item.state.code]
  });
}

// handle when "helper" confirm that "Guess" user has repayed
module.exports.postItem = async function (request, response, next) {
  let itemId = request.params.id;

  const item = await User.Item
    .findById(itemId)
    .populate("helper")
    .populate("guess")
    .exec();

  item.isTrue = true;
  item.save();

  // Remove mail reminder
  nodemailer.deleteRemind(item);

  response.redirect("/helper");
}
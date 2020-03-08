const User = require("../models/user.model");

module.exports.get = async function (request, response, next) {
  const user = response.locals.user;
  const sessionId = response.locals.sessionId;

  if (sessionId.type != "Guess") {
    response.redirect("/helper");
    return;
  }

  const itemsOrdered = await User.Item
    .find({
      guess: user._id,
      isPayed: false,
      isTrue: false
    })
    .populate("guess")
    .populate("helper")
    .sort({
      createdAt: -1
    })
    .exec();

  const itemsPayed = await User.Item
    .find({
      guess: user._id,
      isPayed: true,
      isTrue: false
    })
    .populate("guess")
    .populate("helper")
    .sort({
      createdAt: -1
    })
    .exec();

  const itemsCompleted = await User.Item
    .find({
      guess: user._id,
      isPayed: true,
      isTrue: true
    })
    .populate("guess")
    .populate("helper")
    .sort({
      createdAt: -1
    })
    .exec();

  response.render("guess.pug", {
    user: user,
    itemsOrdered: itemsOrdered,
    itemsPayed: itemsPayed,
    itemsCompleted: itemsCompleted,
    toastTitle: "Admin",
    toastBody: `Welcome ${user.name}`
  });

  return;
}

module.exports.post = async function (request, response, next) {
  const helpers = await User.Helper
    .find();

  response.render("make-order.pug", {
    data: {},
    classInput: {},
    helpers: helpers
  });
}

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
    "I have payed",
    "Pending helper confirm...",
    "Completed"
  ]

  response.render("item-guess.pug", {
    itemId: itemId,
    item: item,
    stateClass: stateClasses[item.state.code],
    buttonClass: item.state.code == 0 ? buttonClasses[0] : buttonClasses[1],
    buttonMessage: buttonMessages[item.state.code]
  });
}

module.exports.postItem = async function (request, response, next) {
  let itemId = request.params.id;

  const item = await User.Item
    .findById(itemId)
    .populate("helper")
    .populate("guess")
    .exec();

  item.isPayed = true;
  item.save();

  response.redirect("/guess");
}

// Error (Why?)
// module.exports.makeOrderPost = async function (request, response, next) {
//   checkFlag = true;

//   let classInput = await {
//     name: "form-control is-valid",
//     cost: "form-control is-valid",
//     address: "form-control is-valid",
//     helper: "form-control is-valid",
//   }

//   await validation(request);

//   async function validation(request) {
//     for (key in classInput) {
//       if (!request.body[key]) {
//         classInput[key] = classInput[key].replace("is-valid", "is-invalid");
//         checkFlag = false;
//       }
//     }
//   }

//   if(!checkFlag) {
//     const helpers = await User.Helper
//       .find();

//     response.render("make-order.pug", {
//       data: request.body,
//       classInput: classInput,
//       helpers: helpers,
//       toastTitle: "Error",
//       toastBody: "Not enough informations."
//     });
//     return;
//   }

//   const helper = await User.Helper
//     .findById(request.body.helper)
//     .populate("itemsReceived")
//     .exec();

//   const guess = response.locals.user;

//   const newItem = new User.Item({
//     name: request.body.name,
//     cost: request.body.cost,
//     address: request.body.address,
//     helper: helper._id,
//     guess: guess._id,
//     isPayed: false,
//     isTrue: false
//   });

//   guess.itemsOrdered.push(newItem._id);
//   helper.itemsReceived.push(newItem._id);

//   newItem.save();
//   guess.save();
//   helper.save();

//   response.redirect("/guess");
// }
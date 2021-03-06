const User = require("../models/user.model");

// render "Guess" user page
module.exports.get = async function (request, response, next) {
  // use locals varible have been set on previous middware
  const user = response.locals.user;
  const sessionId = response.locals.sessionId;

  // If not a "Guess" user -> redirect to "Heper" page
  if (sessionId.type != "Guess") {
    response.redirect("/helper");
    return;
  }

  // find item that "Guess" user hasn't repayed
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

  // find item that "Guess" user has repayed
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

  // find item that "Guess" user has repayed and "Helper" user has confirm it
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

  //! this page hasn't pagination (should add it)
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

// render make-order page if click "Make order now" button
module.exports.post = async function (request, response, next) {
  const helpers = await User.Helper
    .find();

  response.render("make-order.pug", {
    data: {},
    classInput: {},
    helpers: helpers
  });
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

// handle when "Guess" user has repayed
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
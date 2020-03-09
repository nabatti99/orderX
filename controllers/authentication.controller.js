// Use database
const User = require("../models/user.model");
const nodemailer = require("../controllers/nodemailer.controller");

// render login page
module.exports.get = function (request, response, next) {
  response.render("authentication.pug", {
    data: {},
    classInput: {}
  });
}

// login
module.exports.post = async function (request, response, next) {
  // find the user whose his/her username and password match in database
    // "Guess" user
  const filteredGuess = await User.Guess
    .findOne({
      username: request.body.username,
      password: request.body.password
    })
    .populate("itemsOrdered")
    .exec();
    // "Helper" user
  const filteredHelper = await User.Helper
    .findOne({
      username: request.body.username,
      password: request.body.password
    })
    .populate("itemsReceived")
    .exec();

  // create sessionId maxAge
  // 10 minutes
  let maxAge = 10 * 60000;
  if (request.body.isSave)
    maxAge *= 6;

  // If exist "Guess" user
  if (filteredGuess) {
    // Check validation when create new user
    if (filteredGuess.validation == false) {
      response.render("account-validation.pug", {
        message: "Your account is haven't verify yet."
      });

      return;
    }

    await generateCookie(filteredGuess, "Guess");

    response.redirect("/");

    return;
  }
  // If exist "Guess" user
  if (filteredHelper) {
    // Check validation when create new user
    if (filteredHelper.validation == false) {
      response.render("account-validation.pug", {
        message: "Your account is haven't verify yet."
      });

      return;
    }

    await generateCookie(filteredHelper, "Helper");

    response.redirect("/");

    return;
  }

  async function generateCookie(user, type) {
    const newSessionId = await new User.SessionId({
      user: user.id,
      expire: new Date(Date.now() + maxAge),
      type: type
    });

    response.cookie("sessionId", newSessionId.id, {
      maxAge: maxAge,
      signed: true
    });

    user.sessionIds.push(newSessionId._id);

    newSessionId.save();
    user.save();
  }

  response.render("authentication.pug", {
    data: request.body,
    classInput: {},
    toastTitle: "Login Error",
    toastBody: "Invalid username or password."
  })
}

// render register page
module.exports.getRegister = function (request, response, next) {
  response.render("register.pug", {
    data: {},
    classInput: {}
  });
}


// handle submit on register page
module.exports.postRegister = async function (request, response, next) {
  // class in HTML field element on register page
  let classInput = {
    username: "form-control ",
    password: "form-control ",
    name: "form-control ",
    email: "form-control ",
    phoneNumber: "form-control ",
    type: "form-control "
  }

  const option = {
    createGuess: async function (username, password, name, email, phone) {
      // check if username is available
      const filteredGuess = await User.Guess
        .findOne({
          username: username
        });

      const filteredHelper = await User.Helper
        .findOne({
          username: username
        });

      if (filteredGuess || filteredHelper){
        classInput.username.replace("is-valid", "is-invalid");
        throw new Error("Unavailable Username.");
      }

      // if true -> create new "Guess" user
      const newGuess = new User.Guess({
        username: username,
        password: password,
        name: name,
        email: email,
        phoneNumber: phone,
        sessionIds: new Array,
        itemsOrdered: new Array,
        validation: false
      });

      await newGuess.validate()
        .catch(({errors}) => {
          let message = "";
          for (error in errors) {
            message += errors[error].message + "\n";
            classInput[error] = classInput[error].replace("is-valid", "is-invalid");
          }

          throw new Error(message);
        });

      newGuess.save();

      // send mail to verify
      nodemailer.sendVerifyMail(newGuess.email, process.env.VERIFY_LINK + newGuess.id);

      response.redirect("/auth");

      return;
    },

    createHelper: async function (username, password, name, email, phone) {
      // check if username is available
      const filteredHelper = await User.Helper
        .findOne({
          username: username
        });

      const filteredGuess = await User.Guess
        .findOne({
          username: username
        });

      if (filteredHelper || filteredGuess){
        throw new Error("Unavailable Username.");
      }

      // if true -> create new "Helper" user
      const newHelper = new User.Helper({
        username: username,
        password: password,
        name: name,
        email: email,
        phoneNumber: phone,
        sessionIds: new Array,
        itemsReceived: new Array,
        validation: false
      });

      await newHelper.validate()
        .catch(({errors}) => {
          let message = "";
          for (error in errors) {
            message += errors[error].message + "\n";
            classInput[error] = classInput[error].replace("is-valid", "is-invalid");
          }

          throw new Error(message);
        });

      newHelper.save();

      // send mail to verify
      nodemailer.sendVerifyMail(newHelper.email, process.env.VERIFY_LINK + newHelper.id);

      response.redirect("/auth");

      return;
    }
  }

  // check validation HTML fields
  function check(body) {
    let checkFlag = true;
    for (key in body) {
      if (body[key]) {
        classInput[key] += "is-valid";
      } else {
        classInput[key] += "is-invalid";
        checkFlag = false
      }
    }

    if (checkFlag)
      return;
    else
      throw new Error("Require informations.")
  }

  // main
  try {
    check(request.body);
    if (request.body.type === "Guess")
      await option.createGuess(request.body.username, request.body.password, request.body.name, request.body.email, request.body.phoneNumber);
    else
      await option.createHelper(request.body.username, request.body.password, request.body.name, request.body.email, request.body.phoneNumber);
  } catch (error) {
    console.log(error.message);
    response.render("register.pug", {
      data: request.body,
      classInput: classInput,
      toastTitle: "Error",
      toastBody: error.message
    });

    return;
  }

  return;
}

// log out
module.exports.clearCookie = async function (request, response, next) {
  // get varible from previous middware
  const user = response.locals.user;
  const sessionId = response.locals.sessionId;

  // find location of sessionId in sessionIds collection in MongoDB
  let indexSessionId = 0;
  user.sessionIds.forEach((item, index) => {
    if (item.id == sessionId.id)
      indexSessionId = index;
  });

  // remove current sessionId in MongoDB
  user.sessionIds = [
    ...user.sessionIds.slice(0, indexSessionId),
    ...user.sessionIds.slice(indexSessionId + 1)
  ];

  // clear cookie
  response.cookie("sessionId", null, {
    maxAge: 0,
    signed: true
  });

  user.save();
  sessionId.remove();

  response.redirect("/auth");
}

// verify user account
module.exports.verify = async function (request, response, next) {
  let userId = request.params.id; // get id in /:id of url

  // find if "Guess" user
  const filteredGuess = await User.Guess
    .findById(userId)
    .populate("itemsOrdered")
    .exec();

  // find if "Helper" user
  const filteredHelper = await User.Helper
    .findById(userId)
    .populate("itemsReceived")
    .exec();

  // default message
  let message = "Not found this account!"

  // check verify
  if (filteredGuess) {
    filteredGuess.validation = true;
    filteredGuess.save();
    message = "Your account has been verified."
  }

  if (filteredHelper) {
    filteredHelper.validation = true;
    filteredHelper.save();
    message = "Your account has been verified."
  }

  response.render("account-validation.pug", {
    message: message
  })
}

// Middleware
// check and clear sessionId
module.exports.checkCookie = async function (request, response, next) {
  const sessionIds = await User.SessionId
    .find();

  for(sessionId of sessionIds) {
    // check if sessionId has expired
    if (Date.parse(sessionId.expire) - Date.now() < 0) {
      let user = null;
      if (sessionId.type == "Guess")
        user = await User.Guess
          .findById(sessionId.user)
          .populate("sessionIds")
          .exec();
      else
        user = await User.Helper
          .findById(sessionId.user)
          .populate("sessionIds")
          .exec();

      // find sessionId location in sessionIds on MongoDB
      indexSessionId = null;
      user.sessionIds.forEach((userSessionId, i) => {
        if (userSessionId.id == sessionId.id)
          indexSessionId = i;
      });

      // remove sessionId
      user.sessionIds = [
        ...user.sessionIds.slice(0, indexSessionId),
        ...user.sessionIds.slice(indexSessionId + 1)
      ];

      user.save();
      sessionId.remove();
    }
  }

  // check if the browser hasn'n had a sessionId
  let signedCookies = request.signedCookies || new Object();
  if (!signedCookies.sessionId) {
    response.redirect("/auth");
    return;
  }

  await detectUser(response, signedCookies);
  next();
}

// Detect user by sessionId
async function detectUser (response, signedCookies) {
  if (!signedCookies.sessionId) {
    response.locals.sessionId = null;
    response.locals.user = null;
    return;
  }

  // find sessionId in MongoDB
  const currentSessionId = await User.SessionId
    .findById(signedCookies.sessionId);

  // find user by sessionId
  let currentUser = null;
  if (currentSessionId.type == "Guess")
    currentUser = await User.Guess
      .findById(currentSessionId.user)
      .populate("sessionIds")
      .exec();
  else
    currentUser = await User.Helper
      .findById(currentSessionId.user)
      .populate("sessionIds")
      .exec();

  // set locals varibles
  response.locals.sessionId = currentSessionId;
  response.locals.user = currentUser;
}

// detect user without forge to login (just use for home page)
module.exports.detectUser = async function (request, response, next) {
  let signedCookies = request.signedCookies || new Object();
  await detectUser(response, signedCookies);
  next();
};
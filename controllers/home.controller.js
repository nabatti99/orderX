module.exports.get = function (request, response, next) {
  const sessionId = response.locals.sessionId || new Object();
  const user = response.locals.user || new Object();

  response.render("home.pug", {
    user: user,
    sessionId: sessionId,
    toastTile: "Admin",
    toastBody: `Welcome ${user.name || ""}`
  });
}
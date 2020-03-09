const nodemailer = require("nodemailer");
const {setIntervalAsync} = require("set-interval-async/dynamic");
const {clearIntervalAsync} = require("set-interval-async");
const {google} = require("googleapis");

// Using oauth2 (instruction: https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1)
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  "808636525389-p6l4dbkg33kfh67v5bto6i24qq5lbda7.apps.googleusercontent.com", // client_id
  "i5yjIUe_Q9KfKn0-6y3qMsPZ", // client_secret
  "https://developers.google.com/oauthplayground" // Authorized redirect URIs (default)
)

oauth2Client.setCredentials({
  refresh_token: "1//048fk40mvPlwGCgYIARAAGAQSNwF-L9IrAJOgCib15QCDeNzJGqO34u96iOSZWcyc6-oEAwgSP76z6wYbwi5ofFQ378g7XXGkWK4"
});

const accessToken = oauth2Client.getAccessToken();

const transporterInfo = {
  service: "Gmail",
    auth: {
      type: "OAuth2",
      user: "whathtefuch123@gmail.com",
      clientId: "808636525389-p6l4dbkg33kfh67v5bto6i24qq5lbda7.apps.googleusercontent.com",
      clientSecret: "i5yjIUe_Q9KfKn0-6y3qMsPZ",
      refreshToken: "1//048fk40mvPlwGCgYIARAAGAQSNwF-L9IrAJOgCib15QCDeNzJGqO34u96iOSZWcyc6-oEAwgSP76z6wYbwi5ofFQ378g7XXGkWK4",
      accessToken: accessToken
    }
}

// using nodemailer
async function sendMail(receiver, content) {
  let transporter = await nodemailer.createTransport(transporterInfo);

  const mailOptions = {
    from: 'orderX <whathtefuch123@gmail.com>', // sender address
    to: receiver, // list of receivers
    subject: "[OrderX] Remind to repay to the Helper", // Subject line
    generateTextFromHTML: true,
    html: content // html body
  };

  await transporter.sendMail(mailOptions, (error, response) => {
    error ? console.error(error) : console.log(response);
    transporter.close();
  });
}

// storage setIntervals Object
let intervals = [];

async function deleteRemind(item) {
  clearIntervalAsync(intervals[item.remindCode - 1]);
  console.log("done");
}

async function setRemind(guess, item, helper) {
  // Detect remind density
  if (guess.violations <= 20)
    setTime("low");
  else if (guess.violations <= 50)
    setTime("medium");
  else
    setTime("high");

  async function setTime(priority) {
    // set up behavior for remind density
    const options = {
      low: async function (email, content) {
        item.remindCode = await intervals.push(setIntervalAsync(async () => {
          await sendMail(email, content);

          ++guess.violations;
          await guess.save();

          console.log(priority);
        }, 60000 * 60 * 2)); // 2 hours

        item.save();
      },

      medium: async function (email, content) {
        item.remindCode = await intervals.push(setIntervalAsync(async () => {
          await sendMail(email, content);

          ++guess.violations;
          await guess.save();

          console.log(priority);
        }, 60000 * 60)); // 1 hours

        item.save();
      },

      high: async function (email, content) {
        item.remindCode = await intervals.push(setIntervalAsync(async () => {
          await sendMail(email, content);

          ++guess.violations;
          await guess.save();

          console.log(priority);
        }, 60000 * 30)); // 30 minutes

        item.save();
      }
    }

    // use option
    options[priority](guess.email, await info(item));

    // the function writing content in reminder mail 
    async function info(item) {
      let content = "<div>";
      content += `<h1>Hey ${guess.name}, You have been implied ${helper.name} to buy ${item.name} at ${item.address} and it cost ${item.cost} VND, so you should repay money!</h1>`;
      content += "<h2>Helper information:</h2>";
      content += `<p><strong>Name:</strong> ${helper.name}</p>`;
      content += `<p><strong>Email:</strong> ${helper.email}</p>`;
      content += `<p><strong>Phone number:</strong> ${helper.phoneNumber}</p>`;
      content += "<hr>";
      content += "<p>Thank,</p>";
      content += "<p>From orderX.</p>";
      content += "</div>";

      return content;
    }
  }
}

//! If the server restart -> all the reminder will be remove
module.exports.setRemind = setRemind;
module.exports.deleteRemind = deleteRemind;
module.exports.sendVerifyMail = async function (receiver, verifyLink) { // the function sending mail to verify account
  let content = "<div>";
  content += `<p>Hey, did you have registered at <strong>orderX</strong>? If not, you can remove this mail.</p>`;
  content += `<p><strong>Link to verify:</strong> <a href=${verifyLink}>${verifyLink}</a>.</p>`;
  content += "<p>Thank,</p>";
  content += "<p>From orderX.</p>";
  content += "</div>";

  let transporter = await nodemailer.createTransport(transporterInfo);

  const mailOptions = {
    from: 'orderX <whathtefuch123@gmail.com>', // sender address
    to: receiver, // list of receivers
    subject: "[OrderX] Verify your account", // Subject line
    generateTextFromHTML: true,
    html: content // html body
  };

  await transporter.sendMail(mailOptions, (error, response) => {
    error ? console.error(error) : console.log(response);
    transporter.close();
  });
}
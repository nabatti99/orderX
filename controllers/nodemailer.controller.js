const nodemailer = require("nodemailer");
const {setIntervalAsync} = require("set-interval-async/dynamic");
const {clearIntervalAsync} = require("set-interval-async");

async function sendMail(receiver, content) {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "whathtefuch123@gmail.com",
      pass: "Asd12345"
    }
  });

  let info = await transporter.sendMail({
    from: 'orderX <whathtefuch123@gmail.com>', // sender address
    to: receiver, // list of receivers
    subject: "[OrderX] Remind to repay to the Helper", // Subject line
    text: "Nodemailer", // plain text body
    html: content // html body
  });
  console.log("Message sent: %s", info.messageId);
  console.log(`Message was sent to ${receiver}.`);
}

let intervals = [];

async function deleteRemind(item) {
  clearIntervalAsync(intervals[item.remindCode - 1]);
  console.log("done");
}

async function setRemind(guess, item, helper) {
  if (guess.violations <= 20)
    setTime("low");
  else if (guess.violations <= 50)
    setTime("medium");
  else
    setTime("high");

  async function setTime(priority) {
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

    options[priority](guess.email, await info(item));

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

module.exports.setRemind = setRemind;
module.exports.deleteRemind = deleteRemind;
module.exports.sendVerifyMail = async function (receiver, verifyLink) {
  let content = "<div>";
  content += `<p>Hey, did you have registered at <strong>orderX</strong>? If not, you can remove this mail.</p>`;
  content += `<p><strong>Link to verify:</strong> <a href=${verifyLink}>Verify your account</a>.</p>`;
  content += "<p>Thank,</p>";
  content += "<p>From orderX.</p>";
  content += "</div>";

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "whathtefuch123@gmail.com",
      pass: "Asd12345"
    }
  });

  let info = await transporter.sendMail({
    from: 'orderX <whathtefuch123@gmail.com>', // sender address
    to: receiver, // list of receivers
    subject: "[OrderX] Verify your account", // Subject line
    text: "Nodemailer", // plain text body
    html: content // html body
  });
  console.log("Message sent: %s", info.messageId);
  console.log(`Message was sent to ${receiver}.`);
}
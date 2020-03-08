const mongoose = require("mongoose");
const Schema = require("../controllers/database.controller");

const GuessSchema = new Schema ({
  username: String,
  password: String,
  name:String,
  email: String,
  phoneNumber: String,
  violations: {
    type: Number,
    default: 0
  },
  sessionIds: [{
    ref: "SessionId",
    type: Schema.Types.ObjectId
  }],
  itemsOrdered: [{
    ref: "Item",
    type: Schema.Types.ObjectId
  }],
  validationUrl: String,
  validation: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const HelperSchema = new Schema ({
  username: String,
  password: String,
  name:String,
  email: String,
  phoneNumber: String,
  likes: {
    type: Number,
    default: 0
  },
  sessionIds: [{
    ref: "SessionId",
    type: Schema.Types.ObjectId
  }],
  itemsReceived: [{
    ref: "Item",
    type: Schema.Types.ObjectId
  }],
  validationUrl: String,
  validation: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const ItemSchema = new Schema ({
  name: String,
  cost: Number,
  address: String,
  isPayed: Boolean,
  isTrue: Boolean,
  remindCode: {
    type: Number,
    default: -1
  },
  guess: {
    ref: "Guess",
    type: Schema.Types.ObjectId
  },
  helper: {
    ref: "Helper",
    type: Schema.Types.ObjectId
  }
}, {
  timestamps: true
});

ItemSchema.virtual("timePass").get(function () {
  const seconds = Math.ceil((Date.now() - Date.parse(this.createdAt)) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours == 0)
    return `about ${minutes} minutes ago.`;

  const days = Math.floor(hours / 24);
  if (days == 0)
    return `about ${hours} hours ago.`;

  const months = Math.floor(days / 30);
  if (months == 0)
    return `about ${days} days ago.`

  const years = Math.floor(months / 12);
  if (years == 0)
    return `about ${months} months ago.`

  return `about ${years} years ago.`
});

ItemSchema.virtual("state").get(function () {
  const options = [
    "Not payed yet.",
    "Pending to confirm...",
    "Completed."
  ]

  if (this.isPayed && this.isTrue)
    return {
      message: options[2], 
      code: 2
    }
  else if (this.isPayed && !this.isTrue)
    return {
      message: options[1],
      code: 1
    }
  return {
    message: options[0],
    code: 0
  }
});

const SessionIdSchema = new Schema ({
  user: String,
  expire: String,
  type: String
});

const Guess = mongoose.model("Guess", GuessSchema);
const Helper = mongoose.model("Helper", HelperSchema);
const Item = mongoose.model("Item", ItemSchema);
const SessionId = mongoose.model("SessionId", SessionIdSchema);

module.exports.Guess = Guess;
module.exports.Helper = Helper;
module.exports.Item = Item;
module.exports.SessionId = SessionId;
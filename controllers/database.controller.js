const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    reconnectTries: 5,
    reconnectInterval: 500,
    poolSize: 10,
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000
});

mongoose.connection.on("error", error => {
    console.error(error);
});

mongoose.connection.once("open", () => {
    console.log("Connect to MongoDB successfully.")
});

module.exports = mongoose.Schema;
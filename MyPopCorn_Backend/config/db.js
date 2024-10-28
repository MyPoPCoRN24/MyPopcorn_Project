const mongoose = require("mongoose");
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 60000,
  family: 4,
};
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URL, options);
mongoose.connection.on("connected", function () {
  console.log("Mongoose connection is open");
});
mongoose.connection.on("error", function (err) {
  console.log("Mongoose connection has occurred " + err + " error");
});
mongoose.connection.on("disconnected", function () {
  console.log("Mongoose connection is disconnected");
});
process.on("SIGINT", function () {
  mongoose.connection.close(function () {
    console.log(
      "Mongoose default connection is disconnected due to application termination"
    );
    process.exit(0);
  });
});

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
mongoose.set("strictPopulate", false);
require("dotenv").config();

const mongoDB = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/surveyApp`;

async function main() {
  await mongoose.connect(mongoDB);
}

module.exports = main;

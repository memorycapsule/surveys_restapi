const mongoose = require("mongoose");
const { questionSchema } = require("./questionsModel.js");

const surveySchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  questions: [questionSchema],
  public: {
    type: Boolean,
    default: true,
  },
  sharedWith: [
    {
      type: String,
    },
  ],
  respondedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Survey = mongoose.model("Survey", surveySchema);

module.exports = { Survey, surveySchema };

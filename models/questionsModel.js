const mongoose = require("mongoose");
const questionSchema = new mongoose.Schema({
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "short-question",
        "paragraph",
        "dropdown",
        "multiple-choice",
        "single-correct-answer",
        "multiple-correct-answer",
        "checkbox",
        "linear-scale",
        "date",
        "time",
        "multiple-choice-grid",
        "email",
        "numerical-value",
      ],
      required: true,
    },
    choices: {
      type: [String],
    },
    // For answers that can have one or more answers in choices.
    selectUpTo: {
      type: Number,
    },
  });

  const Question = mongoose.model("Question", questionSchema);

  module.exports = { Question, questionSchema };
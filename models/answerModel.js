const mongoose = require("mongoose");
const { Survey } = require("./surveyModel.js");

const answerSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Survey",
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      answer: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
  ],
});

answerSchema.pre("find", function () {
  this.populate("surveyId").populate("answers.questionId");
});

answerSchema.pre("validate", async function (next) {
  const survey = await Survey.findById(this.surveyId);
  if (!survey) {
    next("Survey Not found");
  }

  for (const answer of this.answers) {
    const question = survey.questions.id(answer.questionId);
    if (!question) {
      next("Question Not found");
    }

    const questionType = question.type;
    const answerValue = answer.answer;

    if (
      answerValue === undefined ||
      answerValue === null ||
      answerValue === ""
    ) {
      console.log("here");
      next("Answer must be defined");
    }

    if (!survey.questions.some((q) => q._id.equals(answer.questionId))) {
      return next("Question does not belong to survey");
    }
    if (questionType === "short-question" && typeof answerValue !== "string") {
      next("Answer must be a string for short-question.");
      if (answerValue.length > 255) {
        next("Answer can only be 255 characters or less");
      }
    }
    if (questionType === "paragraph" && typeof answerValue !== "string") {
      next("Answer must be a string for paragraph.");
      if (answerValue.length > 10000) {
        next("Answer can only be 10,000 characters or less");
      }
    }
    if (
      questionType === "multiple-correct-answer"
    ) {
      if (!Array.isArray(answerValue)) {
        next("Answer must be an array for multiple correct answer.");
      }
      for (const answer of answerValue) {
        if (!question.choices.includes(answer)) {
          next("Answer must be a valid choice.");
        }
      }
    }
    if (questionType === "multiple-choice-grid") {
      if (Array.isArray(answerValue)) {
        if (answerValue.every(Array.isArray)) {
          for (const row of answerValue) {
            for (const answer of row) {
              for (const choice of question.choices) {
                if (answer !== "0") {
                  if (!choice.includes(answer)) {
                    next("Answer must be a valid choice.");
                  }
                }
              }
            }
          }
        } else {
          next("Answer is not in a valid format");
        }
      } 
    }
    if (
      questionType === "single-correct-answer" ||
      questionType === "dropdown" ||
      questionType === "multiple-choice" ||
      questionType === "checkbox" ||
      questionType === "linear-scale"
    ) {
      if (!question.choices.includes(answerValue)) {
        next("Answer must be a valid choice.");
      }
    }
    if (questionType === "date") {
      if (typeof answerValue !== "string") {
        next("Answer must be a string for date.");
      }
      if (!answerValue instanceof Date) {
        next("Answer must be a valid date.");
      }
    }
    if (questionType === "time") {
      if (!answerValue.includes(":")){
        next("Answer must be a valid time.");
      }
    }
    if (questionType === "email") {
      if (typeof answerValue !== "string") {
       next("Answer must be a string for email.");
      }
      if (!answerValue.includes("@")) {
       next("Answer must be a valid email.");
      }
    }
    if (questionType === "single-correct-answer" || questionType === "multiple-correct-answer" || questionType == "checkbox") {
      if (question.selectUpTo) {
        if (!question.selectUpTo === 1){
          if (Array.isArray(input)) {
            if (input.length > question.selectUpTo) {
              next("Answer should only contain one choice.");
            }
          } else if (question.selectUpTo > 1) {
            next("Answer should be an array of choices.");
          }
        }
      }
    }
    
    if (questionType === "numerical-value") {
      if (isNaN(answerValue)) {
        return next("Answer must be a number for numerical value.");
      }
    }
  }
});

const Answer = mongoose.model("Answer", answerSchema);

module.exports = { Answer, answerSchema };

const yup = require("yup");

const surveyValidationSchema = yup.object().shape({
  heading: yup.string().required("Heading is required."),
  questions: yup
    .array()
    .of(
      yup.object().shape({
        type: yup.string().required("Type is required."),
      })
    )
    .min(1, "Questions are required."),
    public: yup.boolean(),
    sharedWith: yup.array().of(yup.string()),
});

const questionValidationSchema = yup.object().shape({
  type: yup.string().required("Type is required."),
  type: yup
    .string()
    .oneOf(
      [
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
      "Please enter a valid Question Type."
    ),
});

const answerValidationSchema = yup.object().shape({
  answers: yup
    .array().required("Answers are required.")
    .of(
      yup.object().shape({
        questionId: yup.string().required("Question ID is required."),
        answer: yup.mixed().required("Answer is required."),
      })
    )
    .min(1, "Answers are required."),
});

module.exports = {
  surveyValidationSchema,
  questionValidationSchema,
  answerValidationSchema,
};

const { Survey } = require("../../models/surveyModel.js");
const { Answer } = require("../../models/answerModel.js");
const { Question } = require("../../models/questionsModel.js");
const User = require("../../models/userModel.js");
const jwt = require("jsonwebtoken");

/*
Puts a survey in the DB.
Either updates or creates a new survey.
*/
async function putSurvey(surveyId, data) {
  const survey = await Survey.findById(surveyId);
  if (!survey) {
    const survey = new Survey(data);
    await survey.save();
  } else {
    await updateSurvey(survey, data, "put");
  }
  return survey;
}

async function putQuestion(question, data) {
  if (!question) {
    const question = new Question(data);
    await question.save();
  } else {
    await updateQuestion(question, data, "put");
  }
  return question;
}

/*
Updates fields in a survey.
*/
async function updateSurvey(survey, data, method) {
  if (method === "put") {
    survey.heading = data.heading;
    survey.description = data.description;
    survey.questions = data.questions;
    survey.public = data.public;
    survey.choices = data.choices;
  } else if (method === "patch") {
    if (data.heading) survey.heading = data.heading;
    if (data.description) survey.description = data.description;
    if (data.questions) survey.questions = data.questions;
    if (data.public) survey.public = data.public;
    if (data.choices) survey.choices = data.choices;
  }
  await survey.save();
}

/*
Updates fields in a question.
*/
async function updateQuestion(question, data, method) {
  if (method === "put") {
    question.heading = data.heading;
    question.description = data.description;
    question.type = data.type;
    question.choices = data.choices;
    question.selectUpTo = data.selectUpTo;
  } else if (method === "patch") {
    if (data.heading) question.heading = data.heading;
    if (data.description) question.description = data.description;
    if (data.type) question.type = data.type;
    if (data.choices) question.choices = data.choices;
    if (data.selectUpTo) question.selectUpTo = data.selectUpTo;
  }
}

/*
Paginates by limiting the number of surveys
*/
function paginate(req) {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.pageSize) || 5;
  const skip = (page - 1) * size;
  return { size, skip };
}

/*
Gets surveys from the DB.
Returns an array of surveys
Paginated
*/
async function getSurveys(query, req) {
  const { size, skip } = paginate(req);
  const surveys = await Survey.find(query).skip(skip).limit(size);
  return surveys;
}

/*
Check if the user exists in the DB.
Returns false if the user does not exist.
*/
async function checkUserExists(userId) {
  const user = await User.findById(userId);
  if (!user) {
    return false;
  }
  return user;
}

async function checkSurveyExists(surveyId) {
  const survey = await Survey.findById(surveyId);
  if (!survey) {
    return 404;
  }
  return survey;
}

async function checkSurveyShared(surveyId, userId) {
  console.log("helpefunc", surveyId);
  const survey = await Survey.findById(surveyId);
  console.log(survey);
  const user = checkUserExists(userId);
  console.log(survey);
  if (!survey.public) {
    if (!user) {
      return "401";
    }
    if (!survey.sharedWith.includes(user.username)) {
      return survey;
    }
  }
  return survey;
}

const errorStatusCodes = {
  "Question Not found": 404,
  "Answer must be defined": 400,
  "Question does not belong to survey": 400,
  "Answer must be a string for short-question.": 400,
  "Answer can only be 255 characters or less": 400,
  "Answer must be a string for paragraph.": 400,
  "Answer can only be 10,000 characters or less": 400,
  "Answer must be an array for multiple correct answer.": 400,
  "Answer must be a valid choice.": 400,
  "Answer is not in a valid format": 400,
  "Answer must be a string for date.": 400,
  "Answer must be a valid date.": 400,
  "Answer must be a valid time.": 400,
  "Answer must be a string for email.": 400,
  "Answer must be a valid email.": 400,
};

function answerErrorHandler(error) {
  return errorStatusCodes[error];
}

module.exports = {
  putSurvey,
  updateSurvey,
  putQuestion,
  updateQuestion,
  checkSurveyShared,
  checkSurveyExists,
  getSurveys,
  paginate,
  checkUserExists,
  answerErrorHandler,
};

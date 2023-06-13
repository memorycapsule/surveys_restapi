// Express imports
const express = require("express");
const router = express.Router({ mergeParams: true });

// Model imports
const { Survey } = require("../models/surveyModel.js");
const { Question } = require("../models/questionsModel.js");
const User = require("../models/userModel.js");
const { Answer } = require("../models/answerModel.js");
// Validation imports
const { questionValidationSchema } = require("../validations");
const tokenVerification = require("../auth.js");
const {
  getSurveys,
  paginate,
  putQuestion,
  checkUserExists,
  updateQuestion,
  checkSurveyShared,
  checkSurveyExists,
} = require("./helpers/helpers.js");

/*
PATH: api/questions

Returns all public questions.
If user is logged in, returns all questions from shared surveys.

*/
router.get("/questions", tokenVerification, async (req, res) => {
  try {
    const user = await checkUserExists(req.userId);
    const query = user ? { sharedWith: [user.username] } : { public: true };
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * size;
    const surveys = await Survey.find().skip(skip).limit(size);
    const questions = [];
    surveys.forEach((survey) => {
      if (!survey.public && !survey.sharedWith.includes(req.userId)) {
        questions.push(survey.questions);
      }
    });
    res.json(questions);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

/*
PATH: api/answers

Returns all answers from public surveys.

*/
router.get("/answers", tokenVerification, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * size;
    const responses = await Answer.find().skip(skip).limit(size);
    const publicAnswers = [];

    responses.forEach((response) => {
      if (response.surveyId.public) {
        publicAnswers.push(response.answers);
      }
    });

    res.status(200).send(publicAnswers);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// api/surveys/:id/questions/

/*
PATH: api/surveys/:id/questions

Adds a question to a survey.

*/
router.post("/surveys/:id/questions", tokenVerification, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const data = req.body;
    const user = await checkUserExists(req.userId);
    await questionValidationSchema.validate(data);

    if (user) {
      if (!user._id.equals(survey.createdBy)) {
        return res
          .status(403)
          .json({ error: "Access Denied. You are not the owner." });
      }
    }
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      res.status(404).json("Survey not found.");
      return;
    }
    const question = new Question(data);
    survey.questions.push(question);
    await survey.save();
    res.json(question);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

/*
PATH: api/surveys/:id/questions

Returns all questions from a survey.

*/
router.get("/surveys/:id/questions", tokenVerification, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const survey = await checkSurveyExists(surveyId);
    if (survey === "404") {
      res.status(404).json("Survey not found.");
      return;
    }
    const permissions = await checkSurveyShared(surveyId, req.userId);
    if (permissions === "401"){
      return res.status(401).json({ error: "Access Denied. Please sign in." });
    }
    if (permissions === "403"){
      return res
        .status(403)
        .json({ error: "Access Denied. This survey is not shared with you" });
    }



    const questions = survey.questions;
    res.json(questions);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

/*
PATH: api/surveys/:id/questions/:questionid

Returns a question from a survey.

*/
router.get("/surveys/:id/questions/:questionid", tokenVerification, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const questionId = req.params.questionid;
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      res.status(404).json("Survey not found.");
      return;
    }
    const permissions = await checkSurveyShared(surveyId, req.userId);
    if (permissions === "401"){
      return res.status(401).json({ error: "Access Denied. Please sign in." });
    }
    if (permissions === "403"){
      return res
        .status(403)
        .json({ error: "Access Denied. This survey is not shared with you" });
    }


    const question = survey.questions.id(questionId);
    res.json(question);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// api/surveys/:id/questions/:questionid

/*
PATH: api/surveys/:id/questions/:questionid

Updates or creates a question.

*/
router.put("/surveys/:id/questions/:questionid", tokenVerification, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const questionId = req.params.questionid;
    const data = req.body;

    await questionValidationSchema.validate(data);

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found." });
    }

    const permissions = await checkSurveyShared(surveyId, req.userId);
    if (permissions === "401"){
      return res.status(401).json({ error: "Access Denied. Please sign in." });
    }
    if (permissions === "403"){
      return res
        .status(403)
        .json({ error: "Access Denied. This survey is not shared with you" });
    }

    const question = await putQuestion(survey.questions.id(questionId), data);
    await survey.save();
    res.json(question);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

/*

PATH: api/surveys/:id/questions/:questionid

Updates a question partially.

*/
router.patch("/surveys/:id/questions/:questionid", async (req, res) => {
  try {
    const surveyId = req.params.id;
    const questionId = req.params.questionid;
    const data = req.body;

    await questionValidationSchema.validate(data);

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found." });
    }
    const question = survey.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }
    await updateQuestion(question, data, "patch");
    res.json(question);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

/*
PATH: api/surveys/:id/questions/:questionid

Deletes a question.

*/
router.delete("/surveys/:id/questions/:questionid", async (req, res) => {
  try {
    const questionId = req.params.questionid;
    const surveyId = req.params.id;
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found." });
    }
    const question = survey.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }
    survey.questions.pull(questionId);
    await survey.save();
    res.json("Question has been deleted!");
  } catch (error) {
    console.log(error);

    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

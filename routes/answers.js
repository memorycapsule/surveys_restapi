const express = require("express");
const router = express.Router({ mergeParams: true });
const { Survey } = require("../models/surveyModel.js");
const { Answer } = require("../models/answerModel.js");
const User = require("../models/userModel.js");
const tokenVerification = require("../auth.js");
const { answerValidationSchema } = require("../validations.js");
const { checkUserExists, answerErrorHandler } = require("./helpers/helpers.js");

/*
PATH: /api/surveys/:id/answers

Returns all answers from a survey.
Authentication to check if survey is public or not,
*/
router.get("/", tokenVerification, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const responses = await Answer.find({ surveyId }, "answers");

    const user = await checkUserExists(req.userId);
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }
    if (!survey.public) {
      if (!user) {

        return res.status(401).json({
          error: "Unauthorized. This survey is private. Please login.",
        });
      }

      if (!survey.sharedWith.includes(user.username)) {

        return res.status(401).json({
          error:
            "Unauthorized. This survey is private and is not shared with you",
        });
      }
    }

    const answers = [];
    responses.forEach((response) => {
      answers.push({ surveyId: response._id, answers: response.answers });
    });

    res.json(answers);
  } catch (error) {
    let status = answerErrorHandler(error) ? answerErrorHandler(error) : 400;
    res.status(status).json({ error: error });
  }
});

/*
PATH: /api/surveys/:id/answers/:answerId

Returns a specific answer from a survey.
*/
router.get("/:id", async (req, res) => {
  try {
    const responseId = req.params.id;

    const response = await Answer.findById(responseId);
    if (!response) {
      return res.status(404).json({ error: "Answer not found" });
    }

    res.json(response);
  } catch (error) {
    let status = answerErrorHandler(error) ? answerErrorHandler(error) : 400;
    res.status(status).json({ error: error });
  }
});

/*
PATH: /api/surveys/:id/answers

Creates a new submission to a survey.
*/
router.post("/", tokenVerification, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const data = req.body;
    const user = await checkUserExists(req.userId);
    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }
    if (!survey.public) {
      if (!user) {
        return res
          .status(401)
          .json({ error: "This survey is private. Please login." });
      } else {
        if (!survey.sharedWith.includes(user.username)) {
          res
            .status(403)
            .json("This survey is private and is not shared with you");
          return;
        }
        if (survey.respondedUsers.includes(req.userId)) {
          return res
            .status(403)
            .json({ error: "You have already responded to this survey" });
        }
      }
    }


    await answerValidationSchema.validate(data);
    const response = new Answer({
      surveyId: surveyId,
      answers: data.answers,
    });
    await response.save();
    survey.respondedUsers.push(req.userId);
    await survey.save();
    res.json(response);
  } catch (error) {
    let status = answerErrorHandler(error) ? answerErrorHandler(error) : 400;
    res.status(status).json({ error: error });
  }
});

/*
PATH: /api/surveys/:id/answers/:answerId

Updates a specific answer from a survey.
*/
router.put("/:answerId", tokenVerification, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const data = req.body;
    const user = req.userId ? await User.findById(req.userId) : null;
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }
    const response = await Answer.findById(req.params.answerId);
    if (!response) {
      return res.status(404).json({ error: "Response not found" });
    }
    if (!survey.public) {
      if (!user) {
        return res
          .status(401)
          .json({ error: "This survey is private. Please login." });
      } else {
        if (!survey.respondedUsers.includes(user._id)) {
          return res
            .status(403)
            .json({ error: "You have not responded to this survey yet" });
        }
        if (!survey.sharedWith.includes(user.username)) {
          return res.status(403).json({
            error: "This survey is private and is not shared with you",
          });
        }
      }
    }

    response.answers = data.answers;
    await response.validate();
    await response.save();
    res.json(response);
  } catch (error) {
    let status = answerErrorHandler(error) ? answerErrorHandler(error) : 400;
    res.status(status).json({ error: error });
  }
});

/*
PATH: /api/surveys/:id/answers/:answerId

Updates a specific response to a survey.
*/
router.patch("/:answerId", tokenVerification, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const data = req.body;
    const user = await checkUserExists(req.userId);
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found." });
    }
    const response = await Answer.findById(req.params.answerId);
    if (!response) {
      return res.status(404).json({ error: "Response not found." });
    }
    if (!survey.public) {
      if (!user) {
        return res
          .status(401)
          .json({ error: "This survey is private. Please login." });
      } else {
        if (!survey.respondedUsers.includes(user._id)) {
          return res
            .status(403)
            .json({ error: "You have not responded to this survey yet" });
        }
        if (!survey.sharedWith.includes(user.username)) {
          return res
            .status(403)
            .json("This survey is private and is not shared with you");
        }
      }
    }
    response.answers = data.answers;
    await response.validate();
    await response.save();
    res.json(response);
  } catch (error) {
    let status = answerErrorHandler(error) ? answerErrorHandler(error) : 400;
    res.status(status).json({ error: error });
  }
});

/*
PATH: /api/surveys/:id/answers/:answerId

Deletes a specific response to a survey.
*/
router.delete("/:answerId", tokenVerification, async (req, res) => {
  try {
    const answerId = req.params.answerId;

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ error: "Answer not found" });
    }
    await Answer.deleteOne({ _id: answerId });
    res.json("Answer has been deleted!");
  } catch (error) {
    let status = answerErrorHandler(error) ? answerErrorHandler(error) : 400;
    res.status(status).json({ error: error });
  }
});

module.exports = router;

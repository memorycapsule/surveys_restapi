const express = require("express");
const router = express.Router();
const { Survey } = require("../models/surveyModel.js");
const User = require("../models/userModel.js");
const { surveyValidationSchema } = require("../validations");
const tokenVerification = require("../auth");
const { getSurveys, putSurvey, updateSurvey } = require("./helpers/helpers.js");

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

/*
PATH: api/surveys

Returns an array of surveys. 
If user is logged in, returns an array of shared surveys.
*/
router.get("/", tokenVerification, async (req, res) => {
  try {
    const user = await checkUserExists(req.userId);
    const query = user ? { sharedWith: [user.username] } : { public: true };
    const surveys = await getSurveys(query, req);
    res.json(surveys);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

/*
PATH: /api/surveys/:id

Returns a survey by id.
Authentication to check if survey is public or not,
and whether the user has access to the survey.
*/
router.get("/:id", tokenVerification, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: "Survey does not exist..." });
    }
    const user = await checkUserExists(req.userId);
    if (!user) {
      if (!survey.public) {
        return res
          .status(403)
          .json({ error: "This survey is private. Please login." });
      }
    } else {
      if (!survey.public && !survey.sharedWith.includes(user.username)) {
        return res.status(403).json({
          error: "This survey is private and is not shared with you...",
        });
      }
    }
    res.json(survey);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

/*
PATH: /api/surveys/

Creates a new survey.
If user is signed in , registers the survey to the user.
Otherwise, the survey is public with no owner.
*/
router.post("/", tokenVerification, async (req, res) => {
  try {
    const data = req.body;
    let survey;
    await surveyValidationSchema.validate(data);
    if (!req.userId) {
      survey = new Survey({data});
    }
     survey = new Survey({
      ...data,
      createdBy: req.userId,
    });

    await survey.save();
    res.json(survey);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

/*
PATH: api/surveys/:id

Updates a new survey.

Otherwise, the survey is public with no owner.
*/
router.put("/:id", tokenVerification, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const data = req.body;
    await surveyValidationSchema.validate(data);
    const user = await checkUserExists(req.userId);
    let survey = await Survey.findById(surveyId);
    if (survey.createdBy) {
      if (!user) {
        return res.status(403).json({ error: "You are not logged in..." });
      }
      if (!user._id.equals(survey.createdBy)) {
        return res.status(403).json({ error: "You are not the owner..." });
      }
    } 

    survey = await putSurvey(surveyId, data);
    await survey.save();
    res.json(survey);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});



/*
PATH: api/surveys/:id

Updates a new survey partially.
*/
router.patch("/:id", tokenVerification, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const survey = await Survey.findById(surveyId);
    const user = await checkUserExists(req.userId);

    if (survey.createdBy) {
      if (!user) {
        return res.status(403).json({ error: "You are not logged in..." });
      }
      if (!user._id.equals(survey.createdBy)) {
        return res.status(403).json({ error: "You are not the owner..." });
      }
    } 
    if (!survey) {
      return res.status(404).json({ error: "Survey does not exist." });
    }
    updateSurvey(survey, req.body, "patch");
    res.json(survey);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

/*
PATH : api/surveys/:id

Deletes a survey by id.
*/
router.delete("/:id", tokenVerification, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const survey = await Survey.findById(surveyId);
    const user = await checkUserExists(req.userId);
    if (survey.createdBy) {
      if (!user) {
        return res.status(403).json({ error: "You are not logged in..." });
      }
      if (!user._id.equals(survey.createdBy)) {
        return res.status(403).json({ error: "You are not the owner..." });
      }
    } 
    if (!survey) {
      return res.status(404).json({ error: "Survey does not exist..." });
    }
    await Survey.deleteOne({ _id: surveyId });
    res.json("Survey has been deleted!");
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

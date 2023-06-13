const request = require("supertest");
const expect = require("chai").expect;
const { Answer } = require("../models/answerModel.js");

describe("Answer API", () => {
  let surveyId;
  let questionId;
  let answerId;
  it("should create a new survey", async () => {
    const response = await request("http://localhost:3000")
      .post("/api/surveys")
      .send({
        heading: "Test Survey for Answers",
        description: "This is a test survey for Answers",
        questions: [
          {
            heading: "Multiple Choice Question",
            description: "Select an option",
            type: "multiple-choice",
            choices: ["1", "2", "3", "4"],
          },
        ],
      });
    expect(response.status).to.eql(200);
    surveyId = response.body._id;
    questionId = response.body.questions[0]._id;
  });
  it("should accept response for survey", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers`)
      .send({
        answers: [
          {
            questionId: questionId,
            answer: "2",
          },
        ],
      });
      answerId = response.body._id;
      console.log("answerid", answerId);
    expect(response.status).to.eql(200);
  });
  it("should update response", async () => {
    const response = await request("http://localhost:3000")
      .put(`/api/surveys/${surveyId}/answers/${answerId}`)
      .send({
        answers: [
          {
            questionId: questionId,
            answer: "3",
          },
        ],
      });

    expect(response.status).to.eql(200);
  });
  it("should accept a response with the same answer", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers`)
      .send({
        answers: [
          {
            questionId: questionId,
            answer: "3",
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should error if response given not in choices", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers`)
      .send({
        answers: [
          {
            questionId: questionId,
            answer: "a",
          },
        ],
      });
    expect(response.status).to.eql(400);
  });
  it("should error if no response", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers`)
      .send({
        answers: [
          {
            questionId: questionId,
            answer: "",
          },
        ],
      });
    expect(response.status).to.eql(400);
  });
  it("should error if question doesn't exist", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers`)
      .send({
        answers: [
          {
            questionId: "123",
            answer: "1",
          },
        ],
      });
    expect(response.status).to.eql(404);
  });
  it("should error if survey doesn't exist", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/123/answers`)
      .send({
        answers: [
          {
            questionId: questionId,
            answer: "1",
          },
        ],
      });
    expect(response.status).to.eql(400);
  }
  );
});

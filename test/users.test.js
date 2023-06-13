const request = require("supertest");
const expect = require("chai").expect;
const User = require("../models/userModel");
describe("Users API", () => {
  let token;
  let surveyIdNotShared;
  let surveyIdShared;
  let questionIdNotShared;
  let questionIdShared;
  let answerId;

  it("should create a new user", async () => {
    const res = await request("http://localhost:3000")
      .post("/api/token/signup")
      .send({
        username: "guest",
        password: "guest",
      });
    expect(res.statusCode).equal(200);
    expect(res.body).to.have.property("token");
  });
  it("should create a new survey with a shared user", async () => {
    const res = await request("http://localhost:3000")
      .post("/api/surveys")
      .send({
        heading: "this survey is for a shared user",
        description: "shared user test",
        questions: [
          {
            heading: "short-question",
            description: "enter text...",
            type: "short-question",
            input: "text",
          },
        ],
        public: false,
        sharedWith: ["guest"],
      });
    surveyIdShared = res.body._id;
    questionIdShared = res.body.questions[0]._id;
    console.log(surveyIdShared, questionIdShared);
    expect(res.statusCode).equal(200);
  });
  it("should create a new survey not shared with the user", async () => {
    const res = await request("http://localhost:3000")
      .post("/api/surveys")
      .send({
        heading: "this test checks surveys not shared with user and private",
        description: "user permission test",
        questions: [
          {
            heading: "Multiple Choice",
            description: "Select an option...",
            type: "multiple-choice",
          },
        ],
        public: false,
        sharedWith: ["randomuser"],
      });
    surveyIdNotShared = res.body._id;
    questionIdNotShared = res.body.questions[0]._id;
    expect(res.statusCode).equal(200);
  });
  it("should let user log in", async () => {
    const res = await request("http://localhost:3000")
      .post("/api/token/login")
      .send({
        username: "guest",
        password: "guest",
      });
    expect(res.statusCode).equal(200);
    expect(res.body).to.have.property("token");
    token = res.body.token;
  });
  it("should get surveys user has permission to view", async () => {
    const res = await request("http://localhost:3000")
      .get("/api/surveys")
      .set("Authorization", token);
    expect(res.statusCode).equal(200);
  });
  it("should not get survey user does not have permission to view", async () => {
    const res = await request("http://localhost:3000")
      .get(`/api/surveys/${surveyIdNotShared}`)
      .set("Authorization", token);
    expect(res.statusCode).equal(403);
    expect(res.body).to.have.property("error");
  });
  it("should not create a duplicate user", async () => {
    const res = await request("http://localhost:3000")
      .post("/api/token/signup")
      .send({
        username: "guest",
        password: "guest",
      });
    expect(res.statusCode).equal(409);
    expect(res.body).to.have.property("error");
  });
  it("should try post a response to a survey shared with user", async () => {
    const res = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyIdShared}/answers`)
      .set("Authorization", token)
      .send({
        answers: [
          {
            questionId: `${questionIdShared}`,
            answer: "test response",
          },
        ],
      });
    answerId = res.body._id;
    expect(res.statusCode).equal(200);
  });
  it("should try put the response to the survey", async () => {
    const res = await request("http://localhost:3000")
      .put(`/api/surveys/${surveyIdShared}/answers/${answerId}`)
      .set("Authorization", token)
      .send({
        answers: [
          {
            questionId: `${questionIdShared}`,
            answer: "put test",
          },
        ],
      });
    expect(res.statusCode).equal(200);
  });
  it("should try patch the response to the survey", async () => {
    const res = await request("http://localhost:3000")
      .patch(`/api/surveys/${surveyIdShared}/answers/${answerId}`)
      .set("Authorization", token)
      .send({
        answers: [
          {
            questionId: `${questionIdShared}`,
            answer: "patch test",
          },
        ],
      });
    expect(res.statusCode).equal(200);
  });
  it("should try post a response to a survey not shared with user", async () => {
    const res = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyIdNotShared}/answers`)
      .set("Authorization", token)
      .send({
        answers: [
          {
            questionId: `${questionIdNotShared}`,
            response: "test",
          },
        ],
      });
    expect(res.statusCode).equal(403);
  });
});

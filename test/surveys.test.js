const request = require("supertest");
const expect = require("chai").expect;

describe("Survey API", () => {
  let surveyId;
  let token;
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
  it("should create a new survey", async () => {
    const response = await request("http://localhost:3000")
      .post("/api/surveys")
      .set("Authorization", token)
      .send({
        heading: "Test Survey Creation",
        description: "Testing if surveys create",
        questions: [
          {
            heading: "Multiple Choice Question",
            description: "Select an option",
            type: "multiple-choice",
            choices: ["1", "2", "3", "4"],
          },
        ],
      });
    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("_id");
    expect(response.status).to.eql(200);
    surveyId = response.body._id;
  });
  it("should get first page of surveys with 5 items", async () => {
    const response = await request("http://localhost:3000").get(
      "/api/surveys?page=1&pageSize=5"
    );
    expect(response.status).to.eql(200);
    expect(response.body.length).to.eql(5);
  });
  it("should get a survey by id", async () => {
    const response = await request("http://localhost:3000").get(
      `/api/surveys/${surveyId}`
    );
    expect(response.status).to.eql(200);
  });
  it("should error if survey id not valid", async () => {
    const response = await request("http://localhost:3000").get(
      `/api/surveys/-"`
    );
    expect(response.status).to.eql(400);
  });
  it("should put update a survey by id", async () => {
    const response = await request("http://localhost:3000")
      .put(`/api/surveys/${surveyId}`)
      .set("Authorization", token)
      .send({
        heading: "Test Survey",
        description: "This is a test survey 123 456",
        questions: [
          {
            heading: "Test Multiple Choice",
            description: "Select an option...",
            type: "multiple-choice"
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should patch update a survey by id", async () => {
    const response = await request("http://localhost:3000")
      .patch(`/api/surveys/${surveyId}`)
      .set("Authorization", token)
      .send({
        heading: "Test Survey",
        description: "This is a test survey 123 456",
      });
    expect(response.status).to.eql(200);
  });
  it("should get all questions for a survey", async () => {
    const response = await request("http://localhost:3000").get(
      `/api/surveys/${surveyId}/questions`
    );
    expect(response.status).to.eql(200);
  });
  it("should create a new question for a survey", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Email Address",
        description: "Enter your email address",
        type: "email"
      });
    expect(response.status).to.eql(200);
  });
  it("should delete a survey by id", async () => {
    const response = await request("http://localhost:3000")
      .delete(`/api/surveys/${surveyId}`)
      .set("Authorization", token);
    expect(response.status).to.eql(200);
  });
});

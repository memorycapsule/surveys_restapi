const request = require("supertest");
const expect = require("chai").expect;

describe("Questions API", () => {
  let surveyId;
  let questionId;
  let questionIdForTypes;
  it("should create a new survey", async () => {
    const response = await request("http://localhost:3000")
      .post("/api/surveys")
      .send({
        heading: "Test Survey for Questions API",
        description: "Testing if surveys create",
        questions: [
          {
            heading: "Multiple Choice Question",
            description: "Select an option",
            type: "multiple-choice",
            input: "radio",
            choices: ["1", "2", "3", "4"],
          },
        ],
      });
    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("_id");
    expect(response.status).to.eql(200);
    surveyId = response.body._id;
    questionId = response.body.questions[0]._id;
    console.log("survey ID: " + surveyId);
    console.log("question ID: " + questionId);
  });
  it("should get a question", async () => {
    const response = await request("http://localhost:3000").get(
      `/api/surveys/${surveyId}/questions/${questionId}`
    );
    expect(response.status).to.eql(200);
  });

  it("should add a short-question question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding a short-answer question",
        description: "short-answer question",
        type: "short-question",
      });
      questionIdForTypes = response.body._id;
      expect(response.status).to.eql(200);
  });
  it("should add an answer to the short-question question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: "Answer to short-answer question",
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  
  it("should add a paragaph question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding a paragaph question",
        description: "paragaph question",
        type: "paragraph",
      });
  questionIdForTypes = response.body._id;
    expect(response.status).to.eql(200);
  });
  it("should add an answer to the paragaph question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: "Answer to paragaph question",
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should add a dropdown question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding a dropdown question",
        description: "dropdown question",
        type: "dropdown",
        choices: ["Option 1", "Option 2", "Option 3"],
      });
    questionIdForTypes = response.body._id;
    expect(response.status).to.eql(200);
  });
  it("should add an answer to the dropdown question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: "Option 1",
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should add a multiple-choice question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding a question",
        description: "Added Question",
        type: "multiple-choice",
        choices: ["Option 1", "Option 2", "Option 3"],
      });
    questionIdForTypes = response.body._id;
    expect(response.status).to.eql(200);
  });
  it("should add an answer to the multiple-choice question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: "Option 1",
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should add a single-correct question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding a single-correct question",
        description: "single-correct question",
        type: "single-correct-answer",
        choices: ["Option 1", "Option 2", "Option 3"],
        selectUpTo: 1,
      });
    questionIdForTypes = response.body._id;
    expect(response.status).to.eql(200);
  });
  it("should add an answer to the single-correct question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: "Option 1",
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should error if more than one answer in single-correct question", async () => { 
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: ["Option 1", "Option 2"],
          }
        ],
      });
    expect(response.status).to.eql(400);
  });
  it("should add a multiple-correct question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding a multiple-correct question",
        description: "multiple-correct question",
        type: "multiple-correct-answer",
        choices: ["Option 1", "Option 2", "Option 3"],
        selectUpTo: 2,
      });
      questionIdForTypes = response.body._id;
    expect(response.status).to.eql(200);
  });
  it("should add an answer to the multiple-correct question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: ["Option 1", "Option 2"],
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should add a checkbox question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding a checkbox question",
        description: "checkbox question",
        type: "checkbox",
        choices: ["Option 1", "Option 2", "Option 3"],
        selectUpTo: 1,
      });
      questionIdForTypes = response.body._id;
    expect(response.status).to.eql(200);
  });
  it("should add an answer to the checkbox question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: ["Option 1"],
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should add a linear-scale question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding a linear-scale question",
        description: "linear-scale question",
        type: "linear-scale",
        choices: ["1", "2", "3", "4", "5"],
        selectUpTo: 1,
      });
      questionIdForTypes = response.body._id;
    expect(response.status).to.eql(200);
  });
  it("should add an answer to the linear-scale question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: "1",
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should add a date question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding a date question",
        description: "date question",
        type: "date",
      });
      questionIdForTypes = response.body._id;
    expect(response.status).to.eql(200);
  });
  it("should add an answer to the date question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: "2021-05-05",
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should add a time question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding a time question",
        description: "time question",
        type: "time",
      });
      questionIdForTypes = response.body._id;
    expect(response.status).to.eql(200);
  });
  it("should add an answer to the time question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: "12:00",
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should add a multiple-choice grid question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding a multiple-choice-grid question",
        description: "multiple-choice-grid question",
        type: "multiple-choice-grid",
        choices: [
          ["Row 1", "Row 2", "Row 3"],
          ["Column 1", "Column 2", "Column 3"],
        ],
      });
    questionIdForTypes = response.body._id;
    expect(response.status).to.eql(200);
  });
  it("should add an answer to the multiple-choice-grid question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: [["0", "0"], ["Column 2", "0"]],
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should add an email question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding an email question",
        description: "email question",
        type: "email",
      });

    expect(response.status).to.eql(200);
  });
  it("should add an answer to the email question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: "test@gmail.com",
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should add a numerical-value question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/questions`)
      .send({
        heading: "Adding a numerical-value question",
        description: "numerical-value question",
        type: "numerical-value",
      });
      questionIdForTypes = response.body._id;
    expect(response.status).to.eql(200);
  });
  it("should add an answer to the numerical-value question", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: 5,
          },
        ],
      });
    expect(response.status).to.eql(200);
  });
  it("should error if answer is not a valid type for the question numerical-value", async () => {
    const response = await request("http://localhost:3000")
      .post(`/api/surveys/${surveyId}/answers/`)
      .send({
        answers: [
          {
            questionId: `${questionIdForTypes}`,
            answer: "test",
          },
        ],
      });
    expect(response.status).to.eql(400);
  });
  it("should put update a question", async () => {
    const response = await request("http://localhost:3000")
      .put(`/api/surveys/${surveyId}/questions/${questionId}`)
      .send({
        heading: "Put update a question",
        description: "Select an option...",
        type: "multiple-choice",
        choices: ["Option 1", "Option 2", "Option 3"],
      });
    expect(response.status).to.eql(200);
  });
  it("should patch update a question", async () => {
    const response = await request("http://localhost:3000")
      .patch(`/api/surveys/${surveyId}/questions/${questionId}`)
      .send({
        heading: "Patch update a question",
        description: "Pick an option...",
      });
    expect(response.status).to.eql(200);
  });
  it("should delete a question", async () => {
    const response = await request("http://localhost:3000").delete(
      `/api/surveys/${surveyId}/questions/${questionId}`
    );
    expect(response.status).to.eql(200);
  });
});

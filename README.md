# Survey REST API
Rest API based on survey forms from Google Forms. Users are able to create public and private surveys, add questions of many types, and add responses.
* Users can signup and login to their accounts
* Public (non-authenticated) users can access public surveys on the platform
* Users can share a survey with people by including their username
* Users that want to access a survey shared with them need to login and verify. The api will check if the survey is shared with them
* If a survey is private only users it has been shared with can respond
* Endpoints /api/surveys/, api/questions, and api/answers are paginated

### Installation
This project requires a few packages, but mostly importantly MongoDB will need to be locally installed.
* Run npm -i to install all dependencies
* Create an .env file in your project root folder and add the port, ip, and secret
### Usage
* Run npm start:dev to start the application.
* Connect to the API using Postman on port 27017
### API Endpoints

#### Surveys
| HTTP Verbs | Endpoints | Action |
| --- | --- | --- |
| POST | /api/surveys | To post a new survey |
| GET | /api/surveys | To get all public surveys, unless a token is sent then only private surveys shared with that user is returned. |
| GET | /api/surveys/:surveyid | To retrieve a single survey. Returns survey and its questions. |

#### Questions
| HTTP Verbs | Endpoints | Action |
| --- | --- | --- |
| POST | /api/surveys/:surveyid/questions | To add a new question to a survey |
| GET | /api/questions | To get all questions from public surveys. Returns questions and the surveyId for them. |
| GET | /api/surveys/:surveyid/questions | To retrieve questions for a survey. |
| GET | /api/surveys/:surveyid/questions/:questionId | To retrieve a single question from a survey. |

#### Answers
| HTTP Verbs | Endpoints | Action |
| --- | --- | --- |
| POST | /api/surveys/:surveyid/answers | To respond to a survey |
| GET | /api/answers| To get all answers to public surveys unless a token is provided, then returns answers that the user has made |
| GET | /api/surveys/:surveyid/answers | To retrieve answers for a survey. |
| GET |/api/surveys/:surveyid/answers/:answerId  |To retrieve a single answer from a survey. |

#### Authentication
| HTTP Verbs  | Endpoints  | Action  |
|---|---|---|
| POST  |/api/tokens/login   |To login and get a token|
| POST  |/api/tokens/signup   |To signup and get a token|

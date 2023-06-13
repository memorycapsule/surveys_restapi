const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());

const main = require("./db.js");
main().catch((err) => console.log(err));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Endpoints
const surveysRouter = require('./routes/surveys');
const questionsRouter = require('./routes/questions');
const answersRouter = require('./routes/answers');
const usersRouter = require('./routes/tokens');

app.use('/api/surveys', surveysRouter);
app.use('/api/', questionsRouter);
app.use('/api/surveys/:id/answers', answersRouter);
app.use('/api/token', usersRouter);

// Swagger
const swaggerUi = require('swagger-ui-express');
// swaggerAutoGen = require('swagger-autogen')();
// swaggerAutoGen('./swagger.json', ['./routes/surveys.js', './routes/questions.js', './routes/answers.js', './routes/tokens.js']);
const swaggerFile = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(port, () => {
  console.log(`Survey app listening on port ${port}`);
});

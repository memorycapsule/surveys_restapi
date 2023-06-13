const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger.json";
const endpointsFiles = ["test.js"];

swaggerAutogen(outputFile, endpointsFiles);

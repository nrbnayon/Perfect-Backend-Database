const config = require("../config/config");

const allowedOrigins = [
  config.origin,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
];

module.exports = allowedOrigins;

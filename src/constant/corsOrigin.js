const config = require("../config/config");

const allowedOrigins = [
  config.origin,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://192.168.0.204:3000",
  "http://64.227.144.138:3000",
  "http://64.227.144.138:3001",
  "http://localhost:5173",
  "http://64.227.144.138:3005",
  "https://talently.ltd",
  "https://employer.talently.ltd",
];

module.exports = allowedOrigins;

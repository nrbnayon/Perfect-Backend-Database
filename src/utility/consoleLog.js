const config = require("../config/config");

function ConsoleLog(data) {
  if (config.env === "development") {
    console.log(data);
  }
}

module.exports = ConsoleLog;

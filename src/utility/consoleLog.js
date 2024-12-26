const config = require("../config/config");

function ConsoleLog(data) {
  if (config.env === "false") {
    console.log(data);
  }
}

module.exports = ConsoleLog;

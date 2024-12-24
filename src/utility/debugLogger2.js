const config = require("../config/config");
const chalk = require("chalk");
const util = require("util");
const moment = require("moment");

class Logger {
  static get isDev() {
    return config?.env === "development";
  }

  static getTimestamp() {
    return `[${moment().format("HH:mm:ss")}]`; // Format time as HH:mm:ss
  }

  static formatValue(value) {
    return util.inspect(value, { depth: null, colors: true });
  }

  static info(data) {
    if (this.isDev) {
      console.log(
        chalk.blue(this.getTimestamp()),
        chalk.blue("INFO"),
        this.formatValue(data)
      );
    }
  }

  static error(data) {
    if (this.isDev) {
      console.error(
        chalk.red(this.getTimestamp()),
        chalk.red("ERROR"),
        this.formatValue(data)
      );
      if (data instanceof Error) {
        console.error(chalk.red(data.stack));
      }
    }
  }

  static warn(data) {
    if (this.isDev) {
      console.warn(
        chalk.yellow(this.getTimestamp()),
        chalk.yellow("WARN"),
        this.formatValue(data)
      );
    }
  }

  static debug(data) {
    if (this.isDev) {
      console.debug(
        chalk.cyan(this.getTimestamp()),
        chalk.cyan("DEBUG"),
        this.formatValue(data)
      );
    }
  }

  static success(data) {
    if (this.isDev) {
      console.log(
        chalk.green(this.getTimestamp()),
        chalk.green("SUCCESS"),
        this.formatValue(data)
      );
    }
  }

  static table(data) {
    if (this.isDev && Array.isArray(data)) {
      console.table(data);
    }
  }

  static trace(data) {
    if (this.isDev) {
      console.trace(
        chalk.magenta(this.getTimestamp()),
        chalk.magenta("TRACE"),
        this.formatValue(data)
      );
    }
  }
}

module.exports = Logger;

const { default: mongoose } = require("mongoose");
const { logger, errorLogger } = require("./src/shared/logger");
const config = require("./src/config/config");
const app = require("./index");
const ConsoleLog = require("./src/utility/consoleLog");
const chalk = require("chalk");

async function main() {
  try {
    await mongoose.connect(config.database_url);
    ConsoleLog(chalk.green("🎉 Database connected successfully! 🥳"));
    logger.info(chalk.green("🎉 Database connected successfully! 🥳"));

    const server = app.listen(config.port, () => {
      logger.info(
        chalk.green(`🚀 Server is up and running on port ${config.port}! 🔥`)
      );
    });

    const exitHandler = () => {
      if (server) {
        server.close(() => {
          logger.info(chalk.cyan("👋 Server closed gracefully. Goodbye! 🌟"));
        });
      }
      throw new Error(chalk.red("😱 Application exited with an error! 💥"));
    };

    const unexpectedErrorHandler = (error) => {
      errorLogger.error(
        chalk.red(`💔 Oops! An unexpected error occurred: ${error.message}`)
      );
      exitHandler();
    };

    process.on("uncaughtException", unexpectedErrorHandler);
    process.on("unhandledRejection", unexpectedErrorHandler);

    process.on("SIGTERM", () => {
      logger.info(
        chalk.yellow("🚦 SIGTERM signal received. Shutting down gracefully. 🛑")
      );
      if (server) {
        server.close();
      }
    });
  } catch (error) {
    console.log(
      chalk.red(
        `❌ Database connection failed! The issue is: ${error.message} 😓`
      )
    );
    errorLogger.error(
      chalk.red(
        `❌ Database connection failed! The issue is: ${error.message} 😓`
      )
    );
  }
}

main();

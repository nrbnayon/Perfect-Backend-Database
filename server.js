const { default: mongoose } = require("mongoose");
const { logger, errorLogger } = require("./src/shared/logger");
const config = require("./src/config/config");
const app = require("./index");
const ConsoleLog = require("./src/utility/consoleLog");

async function main() {
  try {
    await mongoose.connect(config.database_url);
    ConsoleLog("🎉 Database connected successfully! 🥳");
    logger.info("🎉 Database connected successfully! 🥳");

    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server is up and running on port ${config.port}! 🔥`);
    });

    const exitHandler = () => {
      if (server) {
        server.close(() => {
          logger.info("👋 Server closed gracefully. Goodbye! 🌟");
        });
      }
      throw new Error("😱 Application exited with an error! 💥");
    };

    const unexpectedErrorHandler = (error) => {
      errorLogger.error(
        `💔 Oops! An unexpected error occurred: ${error.message}`
      );
      exitHandler();
    };

    process.on("uncaughtException", unexpectedErrorHandler);
    process.on("unhandledRejection", unexpectedErrorHandler);

    process.on("SIGTERM", () => {
      logger.info("🚦 SIGTERM signal received. Shutting down gracefully. 🛑");
      if (server) {
        server.close();
      }
    });
  } catch (error) {
    console.log(
      `❌ Database connection failed! The issue is: ${error.message} 😓`
    );
    errorLogger.error(
      `❌ Database connection failed! The issue is: ${error.message} 😓`
    );
  }
}

main();

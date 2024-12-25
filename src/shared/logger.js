const path = require("path");
const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const { combine, timestamp, label, printf } = format;

// Custom Log Format
const myFormat = printf(({ level, message, label, timestamp }) => {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  let emoji = "";
  if (level === "info") {
    emoji = "📣";
  } else if (level === "warn") {
    emoji = "⚠️";
  } else if (level === "error") {
    emoji = "❌";
  } else if (level === "debug") {
    emoji = "🛠️";
  }

  return `${date.toDateString()} ${hour}:${minutes}:${seconds} [${label}] ${level.toUpperCase()} ${emoji}: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(label({ label: "right wow!" }), timestamp(), myFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        "logs",
        "winston",
        "successes",
        "phu-%DATE%-success.log"
      ),
      datePattern: "YYYY-DD-MM-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

const errorLogger = createLogger({
  level: "error",
  format: combine(label({ label: "right wow!" }), timestamp(), myFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        "logs",
        "winston",
        "errors",
        "phu-%DATE%-error.log"
      ),
      datePattern: "YYYY-DD-MM-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

// If we're not in production then log to the `console`
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  );
}

module.exports = { logger, errorLogger };

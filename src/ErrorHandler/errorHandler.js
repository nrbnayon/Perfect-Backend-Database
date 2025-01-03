class ErrorHandler extends Error {
  constructor(message, statusCode, emoji = "❌", stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.emoji = emoji;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ErrorHandler;

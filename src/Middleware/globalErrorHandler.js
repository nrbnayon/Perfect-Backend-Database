/* eslint-disable no-unused-vars */ 
/* eslint-disable no-unused-expressions */ 
 
const { default: mongoose } = require("mongoose"); 
const ErrorHandler = require("../ErrorHandler/errorHandler"); 
const handleCastError = require("../ErrorHandler/handleCastError"); 
const handleValidationError = require("../ErrorHandler/handleValidationError"); 
 
const { errorLogger } = require("../shared/logger"); 
const config = require("../config/config"); 

// Funny Error Message Generator
const errorEmojis = {
  default: '🤯',
  validation: '🧐',
  jwt: '🕵️',
  duplicate: '🤡',
  cast: '🔍',
  network: '🌩️',
  server: '💥',
};

const funnyPhrases = [
  "Oops! Something went sideways 🙃",
  "Looks like our code had too much coffee ☕",
  "Whoopsie-daisy! 🌼",
  "Houston, we have a problem 🚀",
  "Error: Reality check failed 🤖",
  "Quantum uncertainty detected 🌌",
  "Code went on an unexpected vacation 🏖️",
];

const globalErrorHandler = (error, req, res, next) => { 
  // Logging with a touch of humor
  const logMessage = `🐱‍🏍 Error Circus: ${funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)]}`;
  
  if (config.env === "development") { 
    console.log(logMessage, { error }); 
  } else { 
    errorLogger.error(logMessage, error); 
  } 
 
  let statusCode = 500; 
  let message = `${errorEmojis.server} ${funnyPhrases[0]}`; 
  let errorMessages = []; 
 
  if (error && error.name === "ValidationError") { 
    const simplifiedError = handleValidationError(error); 
    statusCode = simplifiedError.statusCode; 
    message = `${errorEmojis.validation} Validation went wild! ${simplifiedError.message}`; 
    errorMessages = simplifiedError.errorMessages; 
  } else if (res.headersSent) { 
    message = error 
      ? `${errorEmojis.network} Headers got cold feet: ${error.message}` 
      : "🏴‍☠️ Headers mutinied before response!"; 
    errorMessages = 
      error && error.message ? [{ path: "", message: error.message }] : []; 
  } else if (error && error.name === "JsonWebTokenError") { 
    message = `${errorEmojis.jwt} 🕵️ Token playing hide and seek: Invalid JSON Web Token`; 
    errorMessages = error.message ? [{ path: "", message }] : []; 
  } else if (error && error.name === "TokenExpiredError") { 
    message = `${errorEmojis.jwt} ⏳ Token took an early retirement: Expired JSON Web Token`; 
    errorMessages = error.message ? [{ path: "", message }] : []; 
  } else if (error && error.code === 11000) { 
    const duplicateKey = Object.keys(error.keyValue)[0];
    message = `${errorEmojis.duplicate} 🤹 Duplicate Circus: ${duplicateKey} tried to sneak in twice!`; 
    errorMessages = error.message ? [{ path: "", message }] : []; 
  } else if (error && error.name === "CastError") { 
    const simplifiedError = handleCastError(error); 
    statusCode = simplifiedError.statusCode; 
    message = `${errorEmojis.cast} 🔮 Type Casting Gone Wrong: ${simplifiedError.message}`; 
    errorMessages = simplifiedError.errorMessages; 
  } else if (error instanceof ErrorHandler) { 
    statusCode = error.statusCode; 
    message = `${errorEmojis.default} 🎢 Custom Error Rollercoaster: ${error.message}`; 
    errorMessages = error.message ? [{ path: "", message: error.message }] : []; 
  } else if (error instanceof Error) { 
    message = `${errorEmojis.default} 🎈 Generic Error Parade: ${error.message}`; 
    errorMessages = error.message ? [{ path: "", message: error.message }] : []; 
  } else if (error instanceof mongoose.Error) { 
    message = `${errorEmojis.default} 🦄 Mongoose Meltdown: ${error.message}`; 
    errorMessages = error.message ? [{ path: "", message: error.message }] : []; 
  } else if (error && error.name === "Application exited with an error") { 
    message = `${errorEmojis.server} 💣 Application Self-Destructed: ${error.message}`; 
    errorMessages = error.message ? [{ path: "", message: error.message }] : []; 
  } 
 
  res.status(statusCode).json({ 
    success: false, 
    message, 
    errorMessages, 
    stack: config.env !== "production" ? error.stack : undefined, 
    funFact: getFunnyErrorFact() // Bonus fun error fact!
  }); 
}; 

// Bonus: Fun Error Facts Generator
function getFunnyErrorFact() {
  const funFacts = [
    "Did you know? Errors are just undocumented features! 🤓",
    "Error handling: Where code goes to think about its mistakes 🤔",
    "Bugs are not a bug, they're a feature in progress! 🐛",
    "Every error is just an opportunity for a creative solution 🚀",
    "Code doesn't break. It just takes an unexpected detour 🛣️",
  ];
  return funFacts[Math.floor(Math.random() * funFacts.length)];
}
 
module.exports = globalErrorHandler;


// /* eslint-disable no-unused-vars */
// /* eslint-disable no-unused-expressions */

// const { default: mongoose } = require("mongoose");
// const ErrorHandler = require("../ErrorHandler/errorHandler");
// const handleCastError = require("../ErrorHandler/handleCastError");
// const handleValidationError = require("../ErrorHandler/handleValidationError");

// const { errorLogger } = require("../shared/logger");
// const config = require("../config/config");

// const globalErrorHandler = (error, req, res, next) => {
//   if (config.env === "development") {
//     console.log("🌍🚨 globalErrorHandler ~ Debug Mode ~", { error });
//   } else {
//     errorLogger.error("🌍🚨 globalErrorHandler ~", error);
//   }

//   let statusCode = 500;
//   let message = "💥 Oops! Something went wrong!";
//   let errorMessages = [];

//   if (error && error.name === "ValidationError") {
//     const simplifiedError = handleValidationError(error);
//     statusCode = simplifiedError.statusCode;
//     message = `🔎 Validation Error: ${simplifiedError.message}`;
//     errorMessages = simplifiedError.errorMessages;
//   } else if (res.headersSent) {
//     message = error
//       ? `📬 Error: ${error.message || "Headers already sent to the client!"}`
//       : "🚨 Headers already sent to the client.";
//     errorMessages =
//       error && error.message ? [{ path: "", message: error.message }] : [];
//   } else if (error && error.name === "JsonWebTokenError") {
//     message = "🔑 Invalid Token! Please log in again. 🔁";
//     errorMessages = error.message ? [{ path: "", message }] : [];
//   } else if (error && error.name === "TokenExpiredError") {
//     message = "⏰ Your token has expired! Time to log in again. 🔑";
//     errorMessages = error.message ? [{ path: "", message }] : [];
//   } else if (error && error.code === 11000) {
//     const duplicateField = Object.keys(error.keyValue).join(", ");
//     message = `🛑 Duplicate Entry Alert! "${duplicateField}" already exists. 🚫`;
//     errorMessages = error.message ? [{ path: "", message }] : [];
//   } else if (error && error.name === "CastError") {
//     const simplifiedError = handleCastError(error);
//     statusCode = simplifiedError.statusCode;
//     message = `🔄 Invalid ID format: ${simplifiedError.message}`;
//     errorMessages = simplifiedError.errorMessages;
//   } else if (error instanceof ErrorHandler) {
//     statusCode = error.statusCode;
//     message = `❗ Custom Error: ${error.message}`;
//     errorMessages = error.message ? [{ path: "", message: error.message }] : [];
//   } else if (error instanceof Error) {
//     message = `⚠️ Oops! ${error.message}`;
//     errorMessages = error.message ? [{ path: "", message: error.message }] : [];
//   } else if (error instanceof mongoose.Error) {
//     message = `⚡ Mongoose Error: ${error.message}`;
//     errorMessages = error.message ? [{ path: "", message: error.message }] : [];
//   } else if (error && error.name === "Application exited with an error") {
//     message = `🚪 The application crashed: ${error.message}`;
//     errorMessages = error.message ? [{ path: "", message: error.message }] : [];
//   }

//   res.status(statusCode).json({
//     success: false,
//     message,
//     errorMessages,
//     stack: config.env !== "production" ? error.stack : undefined,
//   });
// };

// module.exports = globalErrorHandler;

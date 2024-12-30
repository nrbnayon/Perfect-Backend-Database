// rateLimit.middleware.js
const rateLimit = require("express-rate-limit");
const config = require("../config/config");

// Base configuration for rate limiters
const baseConfig = {
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};

// // Helper to generate key from request
// const generateKey = (req, res, next) => {
//   console.log("user: ", req?.user, "id", req?.user?.userId, "ip", req.ip);
//   try {
//     // Generate a key based on userId or email
//     if (req.user?.userId) {
//       return `${req.ip}-${req.user.userId}`;
//     } else if (req.body?.email) {
//       return `${req.ip}-${req.body.email}`;
//     } else {
//       return req.ip; // Fallback to IP address only
//     }
//     next();
//   } catch (error) {
//     console.error("Error in generateKeyMiddleware:", error.message);
//     res
//       .status(500)
//       .json({ error: "An error occurred while generating the key" });
//   }
// };

const generateKey = (req, res, next) => {
  console.log("user: ", req?.user, "id", req?.user?.userId, "ip", req.ip);
  try {
    let key;

    // Generate a key based on userId or email
    if (req.user?.userId) {
      key = `${req.ip}-${req.user.userId}`;
    } else if (req.body?.email) {
      key = `${req.ip}-${req.body.email}`;
    } else {
      key = req.ip; // Fallback to IP address only
    }

    // Attach the generated key to the request object
    req.generatedKey = key;

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error("Error in generateKey middleware:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while generating the key" });
  }
};

// Authentication rate limiter (login/register)
const authLimiter = rateLimit({
  ...baseConfig,
  windowMs: config.security.rateLimit.windowMs || 10 * 60 * 1000, // 10 minutes
  max: config.security.rateLimit.max || 5, // 5 attempts per window
  message: {
    status: "error",
    message:
      "🚫 Too many login/register attempts. Please try again after 10 minutes.",
    tryAfterMinutes: 10,
  },
  keyGenerator: generateKey,
});

// OTP verification rate limiter
const otpLimiter = rateLimit({
  ...baseConfig,
  windowMs: config.security.rateLimit.windowMs || 10 * 60 * 1000, // 10 minutes
  max: 3 || config.security.rateLimit.max, // 3 attempts per window
  message: {
    status: "error",
    message:
      "🚫 Too many OTP verification attempts. Please try again after 10 minutes.",
    tryAfterMinutes: 10,
  },
  keyGenerator: generateKey,
});

// OTP request rate limiter (for requesting new OTPs)
const otpRequestLimiter = rateLimit({
  ...baseConfig,
  windowMs: config.security.rateLimit.windowMs || 10 * 60 * 1000, // 10 minutes
  max: config.security.rateLimit.max || 2, // 2 attempts per window
  message: {
    status: "error",
    message: "🚫 Too many OTP requests. Please try again after 10 minutes.",
    tryAfterMinutes: 10,
  },
  keyGenerator: generateKey,
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  ...baseConfig,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // 3 attempts per window
  message: {
    status: "error",
    message:
      "🚫 Too many password reset attempts. Please try again after 10 minutes.",
    tryAfterMinutes: 10,
  },
  keyGenerator: generateKey,
});

// General API rate limiter for authenticated routes
const apiLimiter = rateLimit({
  ...baseConfig,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 100 requests per window
  message: {
    status: "error",
    message: "🚫 Too many requests. Please try again after 10 minutes.",
    tryAfterMinutes: 10,
  },
  keyGenerator: generateKey,
});

// Export all limiters
module.exports = {
  authLimiter,
  otpLimiter,
  otpRequestLimiter,
  passwordResetLimiter,
  apiLimiter,
};

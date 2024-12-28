const jwt = require("jsonwebtoken");
const config = require("../config/config");

const extractUserFromTokenMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token, config.jwt_key);

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = extractUserFromTokenMiddleware;

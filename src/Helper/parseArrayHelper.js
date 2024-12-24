const ErrorHandler = require("../ErrorHandler/errorHandler");

const parseArrayFields = (req, fields) => {
  try {
    fields.forEach((field) => {
      if (req.body[field]) {
        const fieldValue = JSON.parse(req.body[field]);
        req.body[field] = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
      }
    });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new ErrorHandler(error.message, 400); // Adjust the status code as needed
  }
};

const parseArrayHelper = {
  parseArrayFields,
};

module.exports = parseArrayHelper;

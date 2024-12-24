const parseFormDataArrays = (arrayFields) => async (req, res, next) => {
  console.log(req.body);
  try {
    // Ensure arrayFields is always an array
    console.log("form data check..: ", req.body.education);
    const fieldsToparse = Array.isArray(arrayFields)
      ? arrayFields
      : [arrayFields];

    // Loop through each field that needs to be parsed
    fieldsToparse.forEach((field) => {
      // Handle cases where field exists in body
      if (req.body[field]) {
        // Special handling for education field
        if (field === "education" && typeof req.body[field] === "string") {
          try {
            const parsedEducation = JSON.parse(req.body[field]);
            req.body[field] = Array.isArray(parsedEducation)
              ? parsedEducation
              : [parsedEducation];
            return; // Skip the rest of the processing for education field
          } catch (err) {
            console.error("Error parsing education data:", err);
            req.body[field] = [];
            return;
          }
        }
        // Check if the value is a string before trying to parse
        if (typeof req.body[field] === "string") {
          try {
            // Try to parse the string as JSON
            const parsedValue = JSON.parse(req.body[field]);

            // Handle different cases after parsing
            if (Array.isArray(parsedValue)) {
              // If it's already an array, use it directly
              req.body[field] = parsedValue;
            } else if (parsedValue === null || parsedValue === undefined) {
              // If null or undefined, set as empty array
              req.body[field] = [];
            } else {
              // If single value, wrap in array
              req.body[field] = [parsedValue];
            }
          } catch (err) {
            // If JSON parsing fails, try comma separation
            // Handle empty string case
            if (req.body[field].trim() === "") {
              req.body[field] = [];
            } else {
              req.body[field] = req.body[field]
                .split(",")
                .map((item) => item.trim())
                .filter((item) => item !== ""); // Remove empty items
            }
          }
        } else if (Array.isArray(req.body[field])) {
          // If it's already an array, keep it as is
          req.body[field] = req.body[field];
        } else if (Buffer.isBuffer(req.body[field])) {
          // If it's a Buffer (like image data), skip processing
          return;
        } else {
          // For any other type, wrap in array
          req.body[field] = [req.body[field]];
        }
      } else {
        // If field doesn't exist or is undefined/null, set as empty array
        req.body[field] = [];
      }
    });

    next();
  } catch (error) {
    console.error("Array parsing error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
      errorMessages: [
        {
          path: "",
          message: error.message,
        },
      ],
      stack: error.stack,
    });
  }
};

module.exports = parseFormDataArrays;

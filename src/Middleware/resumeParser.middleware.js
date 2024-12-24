const fileUpload = require("express-fileupload");

// app.use(fileUpload());
const validateFileUploadMiddleware = (
  fileFieldName,
  allowedMimeTypes = [],
  maxFileSizeMB = 5
) => {
  return (req, res, next) => {
    if (!req.files || !req.files[fileFieldName]) {
      return res.status(400).send("No file uploaded.");
    }

    const file = req.files[fileFieldName];
    const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to megabytes

    // Check file type
    if (
      allowedMimeTypes.length > 0 &&
      !allowedMimeTypes.includes(file.mimetype)
    ) {
      // console.log(`Invalid file type: ${file.mimetype}`);
      return res.status(400).send("Invalid file type.");
    }

    // Check file size
    if (fileSizeMB > maxFileSizeMB) {
      // console.log(`File size exceeds the limit: ${fileSizeMB.toFixed(2)} MB`);
      return res
        .status(400)
        .send(`File size should not exceed ${maxFileSizeMB} MB.`);
    }

    // console.log("File validation passed");
    next();
  };
};

module.exports = { validateFileUploadMiddleware };

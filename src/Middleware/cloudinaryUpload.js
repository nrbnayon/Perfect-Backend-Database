const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const ErrorHandler = require("../ErrorHandler/errorHandler");

// Function to upload a file to Cloudinary with an optional folder parameter
const uploadToCloudinary = async (file, folder = "") => {
  return new Promise((resolve, reject) => {
    try {
      const options = folder ? { folder } : {};

      cloudinary.uploader.upload(file.path, options, async (error, result) => {
        try {
          // Remove the file from local storage after uploading
          await fs.promises.unlink(file.path);

          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        } catch (unlinkError) {
          // Handle the unlink error if any
          reject(new ErrorHandler(unlinkError, 500));
        }
      });
    } catch (error) {
      // Handle any other errors
      reject(new ErrorHandler(error, 500));
    }
  });
};

const cloudinaryUploader = {
  uploadToCloudinary,
};

module.exports = cloudinaryUploader;

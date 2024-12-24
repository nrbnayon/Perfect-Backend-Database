const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const ErrorHandler = require("../ErrorHandler/errorHandler");

// Function to upload a file to Cloudinary with an optional folder parameter
const uploadToCloudinary = async (file, folder = "") => {
  return new Promise((resolve, reject) => {
    try {
      const options = folder ? { folder } : {};

      cloudinary.uploader.upload(file.path, options, (error, result) => {
        fs.unlinkSync(file.path);
        if (error) {
       

          reject(error);
        } else {
          resolve(result);
        }
      });
    } catch (error) {
      throw new ErrorHandler(error, 500);
    }
    // Construct the folder path in Cloudinary if a folder is provided
  });
};

const cloudinaryUploader = {
  uploadToCloudinary,
};

module.exports = cloudinaryUploader;

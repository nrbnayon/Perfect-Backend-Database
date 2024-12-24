// Import your cloudinary uploader module

const cloudinaryUploader = require("../Middleware/cloudinaryUpload");

async function uploadAndSetImage(req, file, folderName) {
  if (file) {
    try {
      const uploadedImage = await cloudinaryUploader.uploadToCloudinary(
        file,
        folderName
      );
      if (uploadedImage) {
        const photo = {
          secure_url: uploadedImage.secure_url,
          public_id: uploadedImage.public_id,
        };
        req.body.photo = photo;
      }
    } catch (error) {
      console.error("Error uploading image to Cloudinary: ", error);
      throw error;
    }
  }
}

module.exports = uploadAndSetImage;

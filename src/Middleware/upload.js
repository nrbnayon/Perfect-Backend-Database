const multer = require("multer");
const cloudinary = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const config = require("../config/config");

cloudinary.v2.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

const generateFolder = (req, file) => {
  return `gadget_shop/${file.fieldname}`;
};

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: generateFolder,
    resource_type: "auto",
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000, // 5MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp|gif|svg)$/)) {
      return cb(new Error("Please upload an image"));
    }

    cb(null, true);
  },
});

const UploadImageCloudinary = upload;

// Delete image from cloudinary
const deleteImageCloudinary = async (public_id) => {
  try {
    await cloudinary.v2.uploader.destroy(public_id);
  } catch (error) {
    // console.log(error);
  }
};

module.exports = {
  UploadImageCloudinary,
  deleteImageCloudinary,
};

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const config = require("../config/config");
const CreateUploadsFile = require("../utility/mikDirectory");

const IMAGE_FIELD = "images";
const FILE_FIELD = "files";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

const uploadDir = path.join(__dirname, "..", "uploads");
const imageUploadDirectory = `${uploadDir}/image`;
const fileUploadDirectory = `${uploadDir}/file`;

const directory = [imageUploadDirectory, fileUploadDirectory];
CreateUploadsFile(directory);

const dynamicDestination = (fieldName) => {
  return (req, file, cb) => {
    const uploadPath =
      fieldName === IMAGE_FIELD ? imageUploadDirectory : fileUploadDirectory;
    cb(null, uploadPath);
  };
};

const storage = multer.diskStorage({
  destination: dynamicDestination(IMAGE_FIELD), // Pass the field name dynamically
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName =
      file.originalname
        .replace(fileExtension, "")
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      Date.now() +
      fileExtension;
    cb(null, fileName);
  },
});

const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    return res
      .status(400)
      .send(`Error uploading ${req.files ? "files" : "file"}`);
  }
  next();
};

const handleSingleUpload = (req, res, next) => {
  return upload.single(IMAGE_FIELD)(req, res, (err) =>
    handleUploadErrors(err, req, res, next)
  );
};

const handleMultipleUploads = (req, res, next) => {
  return upload.array([IMAGE_FIELD, FILE_FIELD], 10)(req, res, (err) =>
    handleUploadErrors(err, req, res, next)
  );
};

const uploadMiddleware = (req, res, next) => {
  try {
    if (
      req.files &&
      (Array.isArray(req.files[IMAGE_FIELD]) ||
        Array.isArray(req.files[FILE_FIELD]))
    ) {
      // console.log(req.files);

      const images = req.files[IMAGE_FIELD];
      const files = req.files[FILE_FIELD];

      if (Array.isArray(images) || Array.isArray(files)) {
        return handleMultipleUploads(req, res, next);
      } else {
        return handleSingleUpload(req, res, next);
      }
    } else {
      throw new Error("No files found in the request.");
    }
  } catch (error) {
    // console.log(error);
    return res.status(400).send("Error processing file upload.");
  }
};

const imageExtensions = ["jpg", "jpeg", "png", "webp", "svg"];
const fileExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];

const fileFilter = (req, file, cb) => {
  const validExtensions =
    file.fieldname === IMAGE_FIELD ? imageExtensions : fileExtensions;

  if (
    !file.originalname.match(new RegExp(`\\.(${validExtensions.join("|")})$`))
  ) {
    return cb(
      new Error(
        `Please upload a ${file.fieldname === IMAGE_FIELD ? "image" : "file"}`
      )
    );
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000,
  },
  fileFilter: fileFilter,
});

const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file.path, (error, result) => {
      fs.unlinkSync(file.path);
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const FileUploadHelper = {
  uploadToCloudinary,
  uploadMiddleware,
  upload,
};

module.exports = FileUploadHelper;

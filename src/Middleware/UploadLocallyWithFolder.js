const multer = require("multer");
const path = require("path");

const generateSlug = require("../shared/generateSlug");
const CreateUploadsFile = require("../utility/mikDirectory");

// ----------------------------------------------------
//File Upload directory
const imageUploadDirectory = "./uploads/images";
const fileUploadDirectory = "./uploads/files";

// File Upload storage and file name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file?.fieldname === "image") {
      const userFolder = req.params.folder || "default";
      const destination = path.join(imageUploadDirectory, userFolder);
      //   const destination = path.join(imageUploadDirectory);
      CreateUploadsFile(destination);
      cb(null, destination);
    }
    if (file?.fieldname === "file") {
      const userFolder = req.body.folder || "default";
      const destination = path.join(fileUploadDirectory, userFolder);
      CreateUploadsFile([destination]);
      cb(null, destination);
    }
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file?.originalname);
    // console.log(fileExtension);
    const fileName = generateSlug(file?.originalname);
    // console.log(fileName);
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (file?.fieldname === "image") {
      if (!file?.originalname?.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
        return cb(new Error("Please upload an image"));
      }
    }
    if (file?.fieldname === "files" || file?.fieldname === "file") {
      if (
        !file?.originalname?.match(/\.(pdf|doc|docx|xls|xlsx|csv|ppt|pptx)$/)
      ) {
        return cb(new Error("Please upload a file"));
      }
    }
    cb(null, true);
  },
});

const UploadLocallyWithFolder = upload;

module.exports = UploadLocallyWithFolder;

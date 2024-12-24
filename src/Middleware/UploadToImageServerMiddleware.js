const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const sharp = require("sharp");
const { imageServerURL } = require("../config/config");
const PROJECT1_UPLOAD_URL = imageServerURL;

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000, // 5MB limit
  },
  fileFilter(req, file, cb) {
    if (file.fieldname === "image") {
      if (!file.originalname.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
        return cb(new Error("Please upload an image"));
      }
    }
    cb(null, true);
  },
});

const uploadToImageServer = (folder) => async (req, res, next) => {
  // console.log("req.file uploads :", req);

  try {
    if (
      req.originalUrl.includes("/api/v1/jobs/create") &&
      !req.body.companyName &&
      !req.file
    ) {
      // console.log("first");
      return next();
    } else if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // Optimize the image using sharp without changing dimensions
    const optimizedImageBuffer = await sharp(req.file.buffer)
      .toFormat(req.file.mimetype.split("/")[1], {
        quality: 80,
      })
      .toBuffer();

    const formData = new FormData();
    formData.append("image", optimizedImageBuffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      `${PROJECT1_UPLOAD_URL}/${folder}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    // console.log("link check :", response?.data?.data?.image?.link);

    req.uploadedImageUrl = response?.data?.data?.image?.link || undefined;
    next();
  } catch (error) {
    console.error("Error uploading to Project 1:", error);
    res.status(500).send("Error uploading image");
  }
};

const UploadToImageServerMiddleware = (folder) => [
  upload.single("image"),
  uploadToImageServer(folder),
];

module.exports = UploadToImageServerMiddleware;

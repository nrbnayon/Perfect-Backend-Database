const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const httpStatus = require("http-status");
const ErrorHandler = require("../ErrorHandler/errorHandler");
const { createReadStream } = require("fs");
// const createDriveClient = require("../config/googleDrive.config");
const { google } = require("googleapis");
const config = require("../config/config");

// Configure multer for PDF storage
const storage = multer.diskStorage({
  destination: "temp/resumes/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(
      new ErrorHandler("Only PDF files are allowed!", httpStatus.BAD_REQUEST),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Auto-authorization middleware
const autoGoogleDriveAuthorization = () => {
  return async (req, res, next) => {
    try {
      // Create OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        config.googleDrive.clientId,
        config.googleDrive.clientSecret,
        config.googleDrive.redirectUri
      );

      // Set credentials from environment variables
      oauth2Client.setCredentials({
        access_token: process.env.GOOGLE_DRIVE_ACCESS_TOKEN,
        refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
        token_type: "Bearer",
        expiry_date: process.env.GOOGLE_DRIVE_EXPIRY_DATE
          ? parseInt(process.env.GOOGLE_DRIVE_EXPIRY_DATE)
          : null,
      });

      // Refresh the token if needed
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();

        // Update environment variables with new credentials
        process.env.GOOGLE_DRIVE_ACCESS_TOKEN = credentials.access_token;
        process.env.GOOGLE_DRIVE_EXPIRY_DATE =
          credentials.expiry_date.toString();

        // You might want to update a .env file here, but that's more complex
        // Consider using a secure config management approach
        console.log("Google Drive token refreshed successfully");
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        throw new ErrorHandler(
          "Google Drive authorization failed. Please check credentials.",
          httpStatus.UNAUTHORIZED
        );
      }

      // Attach the authorized client to the request
      req.googleOauth2Client = oauth2Client;
      next();
    } catch (error) {
      next(
        new ErrorHandler(
          "Google Drive authorization failed",
          httpStatus.UNAUTHORIZED
        )
      );
    }
  };
};

// Updated middleware for resume upload
const UploadResumeServerMiddleware = (fieldName) => {
  return [
    // First, use the auto-authorization middleware
    autoGoogleDriveAuthorization(),

    // Then use the file upload middleware
    async (req, res, next) => {
      try {
        // Use promise-based upload
        await new Promise((resolve, reject) => {
          upload.single(fieldName)(req, res, (err) => {
            if (err) reject(err);
            resolve();
          });
        });

        if (!req.file) {
          throw new ErrorHandler("No file uploaded", httpStatus.BAD_REQUEST);
        }

        const filePath = req.file.path;

        // Create drive client using the authorized client from previous middleware
        const drive = google.drive({
          version: "v3",
          auth: req.googleOauth2Client,
        });

        // Upload file to Google Drive
        const response = await drive.files.create({
          requestBody: {
            name: req.file.originalname,
            mimeType: "application/pdf",
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
            properties: {
              userId: req.userId,
              uploadedAt: new Date().toISOString(),
            },
          },
          media: {
            mimeType: "application/pdf",
            body: createReadStream(filePath),
          },
        });

        // Make file publicly accessible
        await drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        });

        // Get public URL
        const publicFile = await drive.files.get({
          fileId: response.data.id,
          fields: "webViewLink, webContentLink",
        });

        // Cleanup local file
        await fs.unlink(filePath);

        // Attach resume link to request body
        req.body.resumeLink = publicFile.data.webViewLink;
        next();
      } catch (error) {
        console.error("Resume upload error:", error);
        next(
          new ErrorHandler(
            "Failed to upload resume to Google Drive",
            httpStatus.INTERNAL_SERVER_ERROR
          )
        );
      }
    },
  ];
};

const extractFileIdFromUrl = (url) => {
  const match = url?.match(/[-\w]{25,}/);
  return match ? match[0] : null;
};

const deleteResumeFromDrive = async (fileUrl) => {
  try {
    if (!fileUrl) return true;

    const fileId = extractFileIdFromUrl(fileUrl);
    if (!fileId) {
      throw new ErrorHandler(
        "Invalid Google Drive URL",
        httpStatus.BAD_REQUEST
      );
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      config.googleDrive.clientId,
      config.googleDrive.clientSecret,
      config.googleDrive.redirectUri
    );

    // Set credentials from environment variables
    oauth2Client.setCredentials({
      access_token: process.env.GOOGLE_DRIVE_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    });

    // Create drive client
    const drive = google.drive({
      version: "v3",
      auth: oauth2Client,
    });

    // Delete the file
    await drive.files.delete({ fileId });

    return true;
  } catch (error) {
    console.error("Error deleting file from Google Drive:", error);
    throw error;
  }
};

module.exports = {
  UploadResumeServerMiddleware,
  deleteResumeFromDrive,
  extractFileIdFromUrl,
};

// const multer = require("multer");
// const path = require("path");
// const drive = require("../config/googleDrive.config");
// const fs = require("fs/promises");
// const httpStatus = require("http-status");
// const ErrorHandler = require("../ErrorHandler/errorHandler");
// const { createReadStream } = require("fs"); // Added to support createReadStream

// // Configure multer for PDF storage
// const storage = multer.diskStorage({
//   destination: "temp/resumes/",
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === "application/pdf") {
//     cb(null, true);
//   } else {
//     cb(
//       new ErrorHandler("Only PDF files are allowed!", httpStatus.BAD_REQUEST),
//       false
//     );
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
// });

// // Updated middleware for resume upload

// const UploadResumeServerMiddleware = (fieldName) => {
//   return async (req, res, next) => {
//     try {
//       await new Promise((resolve, reject) => {
//         upload.single(fieldName)(req, res, (err) => {
//           if (err) reject(err);
//           resolve();
//         });
//       });

//       if (!req.file) {
//         throw new ErrorHandler("No file uploaded", httpStatus.BAD_REQUEST);
//       }

//       const filePath = req.file.path;

//       // Upload file to Google Drive
//       const response = await drive.files.create({
//         requestBody: {
//           name: req.file.originalname,
//           mimeType: "application/pdf",
//           parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//           properties: {
//             userId: req.userId,
//             uploadedAt: new Date().toISOString(),
//           },
//         },
//         media: {
//           mimeType: "application/pdf",
//           body: createReadStream(filePath),
//         },
//       });

//       // Set file permissions
//       await drive.permissions.create({
//         fileId: response.data.id,
//         requestBody: {
//           role: "reader",
//           type: "anyone",
//         },
//       });

//       // Get public URL
//       const publicFile = await drive.files.get({
//         fileId: response.data.id,
//         fields: "webViewLink, webContentLink",
//       });

//       // Cleanup
//       await fs.unlink(filePath);

//       req.body.resumeLink = publicFile.data.webViewLink;
//       next();
//     } catch (error) {
//       if (req.file) {
//         try {
//           await fs.unlink(req.file.path);
//         } catch (unlinkError) {
//           console.error("Error deleting temporary file:", unlinkError);
//         }
//       }
//       next(error);
//     }
//   };
// };

// const extractFileIdFromUrl = (url) => {
//   const match = url?.match(/[-\w]{25,}/);
//   return match ? match[0] : null;
// };

// const deleteResumeFromDrive = async (fileUrl) => {
//   try {
//     const fileId = extractFileIdFromUrl(fileUrl);

//     if (!fileId) {
//       throw new ErrorHandler(
//         "Invalid Google Drive URL",
//         httpStatus.BAD_REQUEST
//       );
//     }

//     // Get file metadata to verify ownership
//     const file = await drive.files
//       .get({
//         fileId: fileId,
//         fields: "owners,properties",
//       })
//       .catch((err) => {
//         if (err.code === 404) return null;
//         throw err;
//       });

//     if (!file) {
//       return true; // File doesn't exist, consider it deleted
//     }

//     // Delete the file
//     await drive.files.delete({
//       fileId: fileId,
//     });

//     return true;
//   } catch (error) {
//     if (error.code === 404) {
//       return true; // File doesn't exist, consider it deleted
//     }
//     console.error("Error deleting file from Google Drive:", error);
//     throw error;
//   }
// };

// module.exports = {
//   UploadResumeServerMiddleware,
//   deleteResumeFromDrive,
//   extractFileIdFromUrl,
// };

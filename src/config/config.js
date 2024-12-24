// config/config.js
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(process.cwd(), ".env") });

module.exports = {
  env: process.env.NODE_ENV,
  jwt_key: process.env.JWT_SECRET_KEY,
  jwt_key_vendor: process.env.JWT_SECRET_KEY_FOR_VENDOR,
  jwt_refresh_key: process.env.JWT_REFRESH_KEY,
  jwt_refresh_token_expire: process.env.JWT_REFRESH_TOKEN_EXPIRE,
  jwt_token_expire: process.env.JWT_TOKEN_EXPIRE,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.SOLT_ROUND,

  // google drive rusume upload configuration

  googleDrive: {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    redirectUri:
      process.env.GOOGLE_DRIVE_REDIRECT_URI ||
      "https://developers.google.com/oauthplayground",
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
  },

  cloudinary: {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  },
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackURL: process.env.CALL_BACK_URL,
  origin: process.env.ORIGIN,
  imageServerURL: process.env.IMAGE_SERVER_URL,
  bulksmsbdApiKey: process.env.BULK_SMS_BD_API_KEY,
  bulksmsbdSenderId: process.env.BULK_SMS_BD_SENDER_ID,

  // New environment variables for resume parsing
  formxAiApi: process.env.FORMX_AI_API,
  xWorkerToken: process.env.X_WORKER_TOKEN,
  xWorkerExtractorId: process.env.X_WORKER_EXTRACTOR_ID,
};

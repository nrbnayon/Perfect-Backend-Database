const dotenv = require("dotenv");
const path = require("path");

// Configure dotenv to read from .env file
dotenv.config({ path: path.join(process.cwd(), ".env") });

module.exports = {
  /**
   * Core Application Settings
   * Contains essential configuration for the application's environment
   * and server setup
   */
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,

  /**
   * JWT Authentication Configuration
   * Multiple JWT secrets and expiration times for different user types
   * and token purposes (access vs refresh)
   */
  jwt_key: process.env.JWT_SECRET_KEY,
  jwt_key_vendor: process.env.JWT_SECRET_KEY_FOR_VENDOR,
  jwt_refresh_key: process.env.JWT_REFRESH_KEY,
  jwt_refresh_token_expire: process.env.JWT_REFRESH_TOKEN_EXPIRE,
  jwt_token_expire: process.env.JWT_TOKEN_EXPIRE,
  bcrypt_salt_rounds: process.env.SOLT_ROUND,

  /**
   * Google Drive Integration Settings
   * Configuration for Google Drive API access, including OAuth credentials
   * and folder settings for file storage
   */
  googleDrive: {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    redirectUri:
      process.env.GOOGLE_DRIVE_REDIRECT_URI ||
      "https://developers.google.com/oauthplayground",
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
  },

  /**
   * Cloudinary Configuration
   * Settings for cloud-based image and media management service
   */
  cloudinary: {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  },

  /**
   * Google OAuth Settings
   * Configuration for Google Sign-In and OAuth authentication
   */
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackURL: process.env.CALL_BACK_URL,

  /**
   * Application URLs
   * Essential URLs for frontend integration and image handling
   */
  origin: process.env.ORIGIN,
  imageServerURL: process.env.IMAGE_SERVER_URL,

  /**
   * Token Expiration Settings
   * Configures various timeouts for different types of tokens
   * and authentication mechanisms
   */
  tokenExpirations: {
    login: process.env.LOGIN_TOKEN_EXPIRATION,
    otp: parseInt(process.env.OTP_EXPIRATION_TIME),
    passwordReset: process.env.PASSWORD_RESET_TOKEN_EXPIRATION,
    cookie: parseInt(process.env.COOKIE_EXPIRATION_DAYS),
  },

  /**
   * Caching Configuration
   * Redis cache settings for improved application performance
   */
  cache: {
    redis: {
      url: process.env.REDIS_URL,
      ttl: parseInt(process.env.REDIS_CACHE_TTL),
    },
  },

  /**
   * Email Service Configuration
   * SMTP settings for sending emails through the application
   */
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  },

  /**
   * Security Settings
   * Configuration for various security measures including
   * rate limiting to prevent abuse
   */
  security: {
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW),
      max: parseInt(process.env.RATE_LIMIT_MAX),
    },
  },
};

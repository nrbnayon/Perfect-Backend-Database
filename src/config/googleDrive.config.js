// config/googleDrive.config.js
const { google } = require("googleapis");
const GoogleDriveTokenService = require("../app/modules/GoogleDriveModel/googleDriveToken.services");
const config = require("./config");

const createDriveClient = async () => {
  try {
    const { accessToken, refreshToken } =
      await GoogleDriveTokenService.getValidToken();

    const oauth2Client = new google.auth.OAuth2(
      config.googleDrive.clientId,
      config.googleDrive.clientSecret,
      config.googleDrive.redirectUri
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.drive({
      version: "v3",
      auth: oauth2Client,
    });
  } catch (error) {
    console.error("Error creating drive client:", error);

    // Provide more specific error handling
    if (error.message.includes("No Google Drive token found")) {
      throw new Error(
        "Google Drive authorization is required. Please navigate to /google/authorize to set up authentication."
      );
    }

    if (error.message.includes("Token refresh failed")) {
      throw new Error(
        "Google Drive authentication has expired. Please re-authorize the connection."
      );
    }

    throw error;
  }
};

module.exports = createDriveClient;

// // config/googleDrive.config.js
// const { google } = require("googleapis");

// const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
// const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
// const REDIRECT_URI = "https://developers.google.com/oauthplayground";
// const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

// const oauth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI
// );

// oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// const drive = google.drive({
//   version: "v3",
//   auth: oauth2Client,
// });

// module.exports = drive;

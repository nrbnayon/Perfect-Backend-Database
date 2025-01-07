// Import necessary modules
const nodemailer = require("nodemailer");
const config = require("../config/config");
const { logger } = require("../shared/logger");

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport(config.email.smtp);

// Function to send an email
exports.sendMail = async (receiverEmail, subject, body) => {
  // console.log("Email send: ", receiverEmail, subject, body);
  try {
    if (!process.env.EMAIL || !process.env.PASSWORD) {
      throw new Error("Email credentials are missing.");
    }

    const info = await transporter.sendMail({
      from: '"📬" <no-reply@nrbnayon.com>',
      to: receiverEmail,
      subject: subject,
      html: body,
    });

    // Log or use the info object for debugging
    logger.info("Email sent info:", info);

    return {
      success: true,
      message: `🎉 Email sent to ${receiverEmail}`,
      info: info,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

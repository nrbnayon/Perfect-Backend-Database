const axios = require("axios");
const config = require("../config/config");

exports.sendOTPForOrderConfirmation = async (toNumber, message) => {
  const apiKey = config.bulksmsbdApiKey;
  const sender_id = config.bulksmsbdSenderId;

  try {
    const { data: response } = await axios.post(
      `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=(${toNumber})&senderid=${sender_id}&message=(${message})`,
      {
        toNumber,
        message,
      }
    );

    if (response?.response_code === 202) {
      // console.log("OTP send Successfully");
    }

    return { status: true, response };
  } catch (error) {
    return { status: false, error: error.toString() };
  }
};

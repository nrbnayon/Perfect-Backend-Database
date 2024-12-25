const jwt = require("jsonwebtoken");

const jwtHandle = async (payload, secret, expireTime) => {
  // console.log("secret...:", secret);
  const token = jwt.sign(
    {
      email: payload?.phone,
      userId: payload?._id,
    },
    secret,
    {
      expiresIn: expireTime,
      // expiresIn: "60000",
    }
  );
  return token;
};

module.exports = jwtHandle;

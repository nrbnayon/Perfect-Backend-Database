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

// const jwt = require("jsonwebtoken");

// const jwtHandle = async (payload, secret, expireTime) => {
//   // console.log("secret...:", secret);
//   const phone = payload?.phone;
//   const vendorName = generateVendorNameFromPhone(phone);

//   const token = jwt.sign(
//     {
//       phone: payload?.phone,
//       userId: payload?._id,
//       vendorName: vendorName,
//     },
//     secret,
//     {
//       expiresIn: expireTime,
//       // expiresIn: "60000",
//     }
//   );
//   return token;
// };

// const generateVendorNameFromPhone = (phone) => {
//   // Remove any non-digit characters
//   const cleanPhone = phone.replace(/\D/g, "");

//   // Take last 4-5 digits to create a unique identifier
//   const suffix = cleanPhone.slice(-4);

//   return `vendor-${suffix}`;
// };

// module.exports = jwtHandle;

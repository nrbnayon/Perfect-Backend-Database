// const phoneFields = [
//   { phone: phoneNumberWith88 },
//   { phone: payload.phone },
//   { phone: phoneNumberWithADD88 },
//   // Add more phone fields as needed
// ];

const userFilterableFields = [
  "searchTerm",
  "email",
  "phone",
  "userStatus",
  "paymentMethod",
  "createdAt",
];

const userSearchableFields = ["email", "phone", "userStatus", "paymentMethod"];

const userConstant = {
  // phoneFields,
  userSearchableFields,
  userFilterableFields,
};
module.exports = userConstant;

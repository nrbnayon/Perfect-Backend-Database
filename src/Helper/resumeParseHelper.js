const fs = require("fs");
const path = require("path");

exports.base64Encode = (file) => {
  const bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap).toString("base64");
};

exports.createTempFile = async (file) => {
  const uploadsDir = path.join(__dirname, "..", "..", "uploads");
  // console.log("File upload done");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const tempFilePath = path.join(uploadsDir, file.name);
  await file.mv(tempFilePath);
  return tempFilePath;
};

exports.removeTempFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// const fs = require("fs");
// const path = require("path");

// exports.base64Encode = (file) => {
//   const bitmap = fs.readFileSync(file);
//   return Buffer.from(bitmap).toString("base64");
// };

// exports.createTempFile = async (file) => {
//   const uploadsDir = path.join(__dirname, "..", "..", "uploads");
//   if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
//   }
//   const tempFilePath = path.join(uploadsDir, file.name);
//   await file.mv(tempFilePath);
//   return tempFilePath;
// };

// exports.removeTempFile = (filePath) => {
//   if (fs.existsSync(filePath)) {
//     fs.unlinkSync(filePath);
//   }
// };

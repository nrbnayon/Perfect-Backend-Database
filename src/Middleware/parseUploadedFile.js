// parseUploadedFile.js
const path = require("path");
const { parseFile } = require("../shared/fileParser");

const parseUploadedFile = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const fileExt = path.extname(req.file.originalname).toLowerCase().slice(1);

  if (["csv", "xlsx", "xls"].includes(fileExt)) {
    try {
      const parsedData = await parseFile(filePath, fileExt);
      // console.log("parsedData :", parsedData);
      req.parsedData = parsedData;
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  next();
};

module.exports = parseUploadedFile;

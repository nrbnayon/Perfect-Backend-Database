// fileParser.js
const csv = require("csv-parser");
const xlsx = require("xlsx");
const fs = require("fs");

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

const parseExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet);
  } catch (error) {
    throw new Error("Error parsing Excel file: " + error.message);
  }
};

const parseFile = async (filePath, fileExt) => {
  switch (fileExt) {
    case "csv":
      return await parseCSV(filePath);
    case "xlsx":
    case "xls":
      return parseExcel(filePath);
    default:
      throw new Error("Unsupported file format for parsing");
  }
};

module.exports = { parseFile };

const fs = require("fs");

const CreateUploadsFile = (directory) => {
  directory.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

module.exports = CreateUploadsFile;

// const fs = require("fs");

// const CreateUploadsFile = (directory) => {
//   console.log(directory);
//   // directory.forEach((dir) => {
//   if (!fs.existsSync(directory)) {
//     fs.mkdirSync(directory, { recursive: true });
//   }
//   // });
// };

// module.exports = CreateUploadsFile;

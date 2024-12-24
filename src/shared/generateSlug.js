const slugify = require("slugify");

const generateSlug = (text) => {
  return slugify(text, { lower: true, trim: true });
};

module.exports = generateSlug;

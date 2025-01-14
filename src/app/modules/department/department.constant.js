const categoryFilterableFields = [
  "categoryName",
  "tag",
  "slug",
  "searchTerm",
  "isActive",
  "_id",
];
const fieldsToModifyFields = [];

const categorySearchableFields = ["categoryName", "tag", "slug"];
const categoriesConstant = {
  categorySearchableFields,
  categoryFilterableFields,
  fieldsToModifyFields,
};
module.exports = categoriesConstant;

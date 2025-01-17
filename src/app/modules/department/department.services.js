const httpStatus = require("http-status");
const ErrorHandler = require("../../../ErrorHandler/errorHandler");
const CategoriesModel = require("./category.model");
const { default: mongoose } = require("mongoose");

const JoiCategoriesValidationSchema = require("./categories.validation");
const generateSlug = require("../../../shared/generateSlug");

const { paginationHelpers } = require("../../../Helper/paginationHelper");
const { searchHelper } = require("../../../Helper/searchHelper");
const categoriesConstant = require("./department.constant");
const { filteringHelper } = require("../../../Helper/filteringHelper");
const { sortingHelper } = require("../../../Helper/sortingHelper");
const { processFilters } = require("../../../Helper/filterProcessor");

const createIndividualCategoriesIntoDB = async (payload) => {
  const categorySlug = generateSlug(payload?.categoryName);
  const isExist = await Categoodel.findOne({
    slug: categorySlug,
  });
  if (isExist) {
    throw new ErrorHandler(
      `${isExist.categoryName} this  already exist!`,
      httpStatus.CONFLICT
    );
  }

  const dptr = new CategoriesModel(payload);
  const newCategory = await categories.save();

  return newCategory;
};
const createCategories = async (session, category) => {
  let categories;
  console.log("category from category service...:", category);
  for (const element of category) {
    if (element._id) {
      categories = await CategoriesModel.findById(element._id);
    } else {
      const { error } =
        JoiCategoriesValidationSchema.categoriesCreateValidationSchema.validate(
          element
        );
      if (error) {
        throw new ErrorHandler(error, httpStatus.BAD_REQUEST);
      }

      const newCategory = new CategoriesModel(element);
      categories = await newCategory.save({ session });
    }
  }

  return categories?._id;
};

const getAllCategoryFromDB = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const pipeline = [];
  const totalPipeline = [{ $count: "count" }];
  const match = {};

  //?Dynamic search added
  const dynamicSearchQuery = searchHelper.createSearchQuery(
    searchTerm,
    categoriesConstant.categorySearchableFields
  );

  if (dynamicSearchQuery && dynamicSearchQuery.length) {
    match.$or = dynamicSearchQuery;
  }
  // ? Dynamic filtering added
  let dynamicFilter;
  if (categoriesConstant.fieldsToModifyFields) {
    // dynamicFilter = processFilters(
    //   filtersData,
    //   trialBalanceConstant.fieldsToModifyFields
    // );
    const processedFilters = processFilters(
      filtersData,
      categoriesConstant.fieldsToModifyFields
    );
    // console.log("processedFilters :", processedFilters);
    dynamicFilter = Object.entries(processedFilters).map(([key, value]) => ({
      [key]: value,
    }));
  } else {
    // Use the regular createDynamicFilter when no fields need special processing
    dynamicFilter = filteringHelper.createDynamicFilter(filtersData);
  }

  // console.log("dynamicFilter : ", dynamicFilter);
  if (dynamicFilter && dynamicFilter.length) {
    match.$and = dynamicFilter;
  }
  // console.log(dynamicFilter);
  // if join projection and otherneeded for before match ar unshift then write here

  if (skip) {
    pipeline.push({ $skip: skip });
  }

  if (limit) {
    pipeline.push({ $limit: limit });
  }

  // sorting
  const dynamicSorting = sortingHelper.createDynamicSorting(sortBy, sortOrder);

  if (dynamicSorting) {
    pipeline.push({
      $sort: dynamicSorting,
    });
  }

  if (Object.keys(match).length) {
    pipeline.unshift({
      $match: match,
    });
    totalPipeline.unshift({
      $match: match,
    });
  }

  const result = await CategoriesModel.aggregate(pipeline);
  const total = await CategoriesModel.aggregate(totalPipeline);
  return {
    meta: {
      page,
      limit,
      total: total[0]?.count,
    },
    data: result,
  };
};

// ? update categories
const updateCategoriesInToDB = async (id, payload) => {
  let isExist = await CategoriesModel.findById(id);
  if (!isExist) {
    throw new ErrorHandler(
      `${id} this category Not Found!`,
      httpStatus.NOT_FOUND
    );
  }

  const result = await CategoriesModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

//? Delete categories info
const deleteCategoriesInToDB = async (id) => {
  let isExist = await CategoriesModel.findById(id);
  if (!isExist) {
    throw new ErrorHandler(
      `${id} this category Not Found!`,
      httpStatus.NOT_FOUND
    );
  }

  const result = await CategoriesModel.findByIdAndDelete(id);

  return result;
};
const categoriesServices = {
  createIndividualCategoriesIntoDB,
  createCategories,
  getAllCategoryFromDB,
  updateCategoriesInToDB,
  deleteCategoriesInToDB,
};
module.exports = categoriesServices;

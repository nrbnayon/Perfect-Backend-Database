const httpStatus = require("http-status");
const catchAsyncError = require("../../../ErrorHandler/catchAsyncError");
const sendResponse = require("../../../shared/sendResponse");
const departmentServices = require("./department.services");
const pick = require("../../../shared/pick");
const departmentConstant = require("./department.constant");
const paginationFields = require("../../../constant/pagination");

const createIndividualDepartment = catchAsyncError(async (req, res) => {
  // console.log("in controller :", req.uploadedImageUrl);
  req.body.icon = { link: req.uploadedImageUrl };

  const result = await departmentServices.createIndividualDepartmentIntoDB(
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Department created successfully",
    data: {
      result,
    },
  });
});
// const createCategories = catchAsyncError(async (req, res) => {
//   console.log("req.body :", req.body);
//   console.log(req.uploadedImageUrl);
// });

// const createCategories = catchAsyncError(async (req, res) => {
//   const file = req.file;
//   // if image ned to upload cloudinary then
//   const folderName = "Categories";
//   await uploadAndSetImage(req, file, folderName);

//   const result = await CategoriesServices.createCategoriesIntoDB(req.body);
//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: "categories created successfully",
//     data: {
//       result,
//     },
//   });
// });

// const getAllCategories = catchAsyncError(async (req, res) => {
//   const filters = pick(req.query, categoriesConstant.categoryFilterableFields);
//   const paginationOptions = pick(req.query, paginationFields);
//   const result = await CategoriesServices.getAllCategoryFromDB(
//     filters,
//     paginationOptions
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "categories Get successfully",
//     meta: result.meta,
//     data: result.data,
//   });
// });

const getAllCategories = catchAsyncError(async (req, res) => {
  req.query.limit = "all";
  const filters = pick(req.query, categoriesConstant.categoryFilterableFields);

  const paginationOptions = pick(req.query, paginationFields);
  const result = await categoriesServices.getAllCategoryFromDB(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories Get successfully",
    data: {
      result,
    },
  });
});

// ? update Categories
const updateCategories = catchAsyncError(async (req, res, next) => {
  const result = await categoriesServices.updateCategoriesInToDB(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories Data Updated Successfully",
    data: {
      result,
    },
  });
});

// ? delete Categories
const deleteCategories = catchAsyncError(async (req, res, next) => {
  const result = await categoriesServices.deleteCategoriesInToDB(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories Data Delete Successfully",
    data: {
      result,
    },
  });
});

const categoriesController = {
  createIndividualCategories,
  getAllCategories,
  updateCategories,
  deleteCategories,
};
module.exports = categoriesController;

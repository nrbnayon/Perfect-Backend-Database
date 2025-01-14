/* eslint-disable node/no-extraneous-require */
const express = require("express");

const departmentController = require("./department.controller");

const UploadToImageServerMiddleware = require("../../../Middleware/UploadToImageServerMiddleware");
const validateRequest = require("../../../Middleware/validateRequest");
const JoiDepartmentValidationSchema = require("./department.validation");

const router = express.Router();

router.post(
  "/create",
  UploadToImageServerMiddleware("departmentIcons"),
  validateRequest(JoiDepartmentValidationSchema.departmentValidationSchema),
  departmentController.createIndividualDepartment
);
router.get("/get-all", departmentController.getAllDepartments);
router.get("/update/:id", departmentController.updateDepartments);
router.get("/delete/:id", departmentController.deleteDepartments);

const departmentRouter = router;

module.exports = departmentRouter;

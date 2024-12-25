/* eslint-disable node/no-extraneous-require */
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const httpStatus = require("http-status");
// const fileUpload = require("express-fileupload");
const globalErrorHandler = require("./src/Middleware/globalErrorHandler");
const router = require("./src/routes");

const createCorsOptions = require("./src/shared/corsOptions");
const allowedOrigins = require("./src/constant/corsOrigin");
const bodyParser = require("body-parser");

const app = express();

const corsOptions = createCorsOptions(allowedOrigins);

app.use(cors(corsOptions));
// app.use(fileUpload());
// app.use(express.json({ limit: "100mb" }));
app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(bodyParser.json());
app.use(cookieParser());

// define routes
app.use("/api/v1", router);

// global error handler
app.use(globalErrorHandler);

// not found Route Defined
app.use((req, res, next) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Not Found!!",
    errorMessage: [
      {
        path: req.originalUrl,
        message: `${req.originalUrl}-This Route Not Found!!`,
      },
    ],
  });
  next();
});

module.exports = app;

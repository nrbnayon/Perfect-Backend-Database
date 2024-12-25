const validateRequest = (schema) => async (req, res, next) => {
  try {
    console.log("console in validateRequest:: ", req.body);
    console.log("Request Headers:", req.headers);
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Raw Body:", req.body);
    await schema.validateAsync(req.body);

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = validateRequest;

const validateRequest = (schema) => async (req, res, next) => {
  try {
    console.log("console in validateRequest:: ", req.body);
    await schema.validateAsync(req.body);

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = validateRequest;

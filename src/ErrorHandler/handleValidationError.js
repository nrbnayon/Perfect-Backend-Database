const handleValidationError = (error) => {
  const errorMessages = error?.details?.map((detail) => ({
    field: detail.context.key,
    message: detail.message,
  }));
  const statusCode = 400;
  return {
    statusCode,
    message: "Validation Error",
    errorMessages,
  };
};

module.exports = handleValidationError;

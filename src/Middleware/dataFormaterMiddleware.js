
const parseArrayFields = (anything) => async (req, res, next) => {
  try {
   

    return next();
  } catch (error) {
    return next(error);
  }
};

const dataFormaterMiddleware = {
  parseArrayFields,
};

module.exports = dataFormaterMiddleware;

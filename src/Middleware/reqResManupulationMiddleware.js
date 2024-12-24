const reqResManupulationMiddleware =
  (customFunction) => async (req, res, next) => {
    try {
      await customFunction(req, res);

      return next();
    } catch (error) {
      return next(error);
    }
  };

module.exports = reqResManupulationMiddleware;

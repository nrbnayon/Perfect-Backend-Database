const calculatePagination = (options) => {
  const page = Number(options.page || 1);
  let limit = Number(options.limit || 10);
  let skip = (page - 1) * limit;

  if (options.limit === "all") {
    limit = 1000000000000000;
    skip = 0;
  }
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || -1;
  // console.log(page);
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

exports.paginationHelpers = {
  calculatePagination,
};

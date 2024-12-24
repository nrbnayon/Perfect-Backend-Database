const createDynamicSorting = (sortBy, sortOrder) => {
  if (sortBy && sortOrder) {
    const keyValue = {};
    keyValue[sortBy] = sortOrder;

    const sortDirection = sortOrder === "asc" || sortOrder === "-1" ? 1 : -1;

    const sortObject = {};
    sortObject[sortBy] = sortDirection;
    return sortObject;
  } else {
    // Return an empty sorting object if no sortOrder are provided
    return {};
  }
};

exports.sortingHelper = {
  createDynamicSorting,
};

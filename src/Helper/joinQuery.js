const joinQuery = (from, localField, foreignField, as) => ({
  $lookup: {
    from,
    localField,
    foreignField,
    as,
  },
});

module.exports = joinQuery;

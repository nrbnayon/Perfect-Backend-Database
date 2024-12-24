const pick = (obj, keys) => {
  const finalObj = {};

  for (const key of keys) {
    if (obj && obj[key]) {
      finalObj[key] = obj[key];
    }
  }

  return finalObj;
};

module.exports = pick;

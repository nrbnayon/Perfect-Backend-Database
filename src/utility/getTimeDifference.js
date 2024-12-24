function getTimeDifference(validateTime) {
  const currentTime = new Date();
  const validateDateTime = new Date(validateTime);

  // Calculate the difference in milliseconds
  const differenceMs = validateDateTime - currentTime;

  // Convert milliseconds to minutes and seconds
  const minutes = Math.floor(differenceMs / (1000 * 60));
  const seconds = Math.floor((differenceMs % (1000 * 60)) / 1000);

  return { minutes, seconds, isValid: differenceMs > 0, differenceMs };
}

module.exports = getTimeDifference;

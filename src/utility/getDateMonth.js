const moment = require("moment");

exports.startOfDayEndOfDay = (date) => {
  try {
    let startOfDay, endOfDay;
    if (date) {
      startOfDay = moment(date).startOf("day").toDate();
      endOfDay = moment(date).endOf("day").toDate();
    } else {
      startOfDay = moment().startOf("day").toDate();
      endOfDay = moment().endOf("day").toDate();
    }

    return { startOfDay, endOfDay };
  } catch (error) {
    console.error("Error in startOfDayEndOfDay function:", error);
    throw error;
  }
};

exports.startOfDayEndOfDayUTC = (date) => {
  try {
    let startOfDay, endOfDay;
    if (date) {
      startOfDay = moment.utc(date).startOf("day").toDate();
      endOfDay = moment.utc(date).endOf("day").toDate();
    } else {
      startOfDay = moment.utc().startOf("day").toDate();
      endOfDay = moment.utc().endOf("day").toDate();
    }

    return { startOfDay, endOfDay };
  } catch (error) {
    console.error("Error in startOfDayEndOfDay function:", error);
    throw error;
  }
};

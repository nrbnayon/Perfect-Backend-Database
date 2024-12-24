const {
  startOfDayEndOfDayUTC,
  startOfDayEndOfDay,
} = require("../utility/getDateMonth");
const moment = require("moment");
const modifyDateFilter = (key, value) => {
  const { startOfDay, endOfDay } = startOfDayEndOfDayUTC(value);

  return {
    [key]: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };
};

const normalizeValue = (value) => {
  if (typeof value === "string") {
    return value.trim().replace(/\s+/g, "-"); // Replace one or more spaces with a single hyphen
  }
  return value;
};

// Helper function to create case-insensitive RegExp
const createRegexFilter = (value) => {
  const normalizedValue = normalizeValue(value);
  return new RegExp(`^${normalizedValue}$`, "i");
};

// Helper function to handle array of values for RegExp
const createArrayRegexFilter = (values) => {
  if (Array.isArray(values)) {
    return {
      $in: values.map((value) => createRegexFilter(value)),
    };
  }
  return createRegexFilter(values);
};
const modifyTwoDatesFilter = (key, value) => {
  const parsedValue = JSON.parse(value);
  const { startOfDay } = startOfDayEndOfDay(parsedValue.startDate);
  const { endOfDay } = startOfDayEndOfDay(parsedValue.endDate);
  // console.log("2 days filtering...");
  // console.log(`${key} :`, parsedValue.startDate);
  // console.log(`key`, parsedValue.endDate);
  return {
    ["date"]: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };
};
// modify posting Date for jobs
const modifyPostingDateFilter = (key, value) => {
  if (value === "all") {
    // Return null or empty object to skip this filter
    return {};
  }

  let startOfDay, endOfDay;

  switch (value) {
    case "latest":
      // For the last 24 hours
      startOfDay = moment().subtract(1, "days").toDate();
      endOfDay = moment().toDate();
      break;

    case "today":
      // Start and end of today
      ({ startOfDay, endOfDay } = startOfDayEndOfDay());
      break;

    case "last 2 days":
      // Start of 2 days ago to the end of today
      ({ startOfDay } = startOfDayEndOfDay(
        moment().subtract(2, "days").toDate()
      ));
      ({ endOfDay } = startOfDayEndOfDay());
      break;

    case "last 3 days":
      // Start of 5 days ago to the end of today
      ({ startOfDay } = startOfDayEndOfDay(
        moment().subtract(3, "days").toDate()
      ));
      ({ endOfDay } = startOfDayEndOfDay());
      break;

    case "last 4 days":
      // Start of 3 days ago to the end of today
      ({ startOfDay } = startOfDayEndOfDay(
        moment().subtract(4, "days").toDate()
      ));
      ({ endOfDay } = startOfDayEndOfDay());
      break;

    case "last 5 days":
      // Start of 3 days ago to the end of today
      ({ startOfDay } = startOfDayEndOfDay(
        moment().subtract(5, "days").toDate()
      ));
      ({ endOfDay } = startOfDayEndOfDay());
      break;

    default:
      throw new Error("Invalid filter value");
  }

  return {
    ["createdAt"]: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };
};
// modify deadline for jobs
const modifyDeadlineDateFilter = (key, value) => {
  let startOfDay = moment().toDate(); // Start from the current time
  let endOfDay;
  value = value.toLowerCase();
  // console.log("Next 5 days error checking key:::", key);
  // console.log("Next 5 days error checking value::", value);

  switch (value) {
    case "today":
      // Deadline within the remainder of today
      endOfDay = moment().endOf("day").toDate();
      break;

    case "next 2 days":
      // Deadline within the next 2 days from now
      endOfDay = moment().add(2, "days").endOf("day").toDate();
      break;

    case "next 3 days":
      // Deadline within the next 3 days from now
      endOfDay = moment().add(3, "days").endOf("day").toDate();
      break;

    case "next 4 days":
      // Deadline within the next 4 days from now
      endOfDay = moment().add(4, "days").endOf("day").toDate();
      break;

    case "next 5 days":
      // Deadline within the next 5 days from now
      endOfDay = moment().add(5, "days").endOf("day").toDate();
      break;

    default:
      throw new Error("Invalid filter value");
  }

  return {
    [key]: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };
};

const processSalaryRange = (rangeString) => {
  if (!rangeString) return null;

  // Remove any whitespace and convert to lowercase
  const cleaned = rangeString.toLowerCase().trim();

  // Extract numbers and period (yearly/monthly)
  const matches = cleaned.match(/^(\d+)-(\d+)\s*(yearly|monthly)?$/);

  if (!matches) return null;

  const [_, min, max, period = "yearly"] = matches;
  return {
    min: parseInt(min),
    max: parseInt(max),
    period,
  };
};

// Function to validate if a range is properly formatted
const isValidSalaryRange = (rangeString) => {
  if (!rangeString) return false;
  const processed = processSalaryRange(rangeString);
  if (!processed) return false;
  return processed.min <= processed.max;
};

// Function to normalize salary range format
const normalizeSalaryRange = (rangeString) => {
  const processed = processSalaryRange(rangeString);
  if (!processed) return null;
  return `${processed.min}-${processed.max} ${processed.period}`;
};

// Function to create MongoDB filter for salary range
const createSalaryRangeFilter = (value) => {
  const processedRange = processSalaryRange(value);
  if (!processedRange) return null;

  const { min, max } = processedRange;

  return {
    $or: [
      // Exact match
      {
        salaryRange: value,
      },
      // Match with period (yearly/monthly)
      {
        salaryRange: new RegExp(`^${min}-${max}\\s*(yearly|monthly)?$`, "i"),
      },
      // Match overlapping ranges
      {
        salaryRange: {
          $regex: new RegExp(`^(\\d+)-(\\d+)\\s*(yearly|monthly)?$`, "i"),
        },
        $expr: {
          $let: {
            vars: {
              range: { $split: ["$salaryRange", "-"] },
            },
            in: {
              $and: [
                {
                  $lte: [{ $toInt: { $arrayElemAt: ["$$range", 0] } }, max],
                },
                {
                  $gte: [
                    {
                      $toInt: {
                        $first: {
                          $split: [{ $arrayElemAt: ["$$range", 1] }, " "],
                        },
                      },
                    },
                    min,
                  ],
                },
              ],
            },
          },
        },
      },
    ],
  };
};

// Function to compare two salary ranges for overlap
const doSalaryRangesOverlap = (range1, range2) => {
  const r1 = processSalaryRange(range1);
  const r2 = processSalaryRange(range2);

  if (!r1 || !r2) return false;

  // Only compare ranges with same period (yearly/monthly)
  if (r1.period !== r2.period) return false;

  return !(r1.max < r2.min || r1.min > r2.max);
};

const createExperienceRangeFilter = (value) => {
  // Handle empty or invalid values
  console.log("exp value: " + value);

  if (!value) return null;
  const yearRegexFragment = "(?:years?|yrs?|yr|y)?";

  // Handle fresher cases (0 or 0-0)
  if (value === "0" || value === "0-0") {
    const fresherConditions = [
      // Match existing 0 year patterns
      new RegExp(`^0\\s*${yearRegexFragment}$`, "i"),
      // Match fresher variations
      /^fresh(?:er|ers?)?$/i,
      // Match "entry level" variations
      /^entry[\s-]?level$/i,
      // Match "no experience" variations
      /^no[\s-]?experience(?:\s*required)?$/i,
      // Match ranges starting with 0
      new RegExp(`^0-\\d+\\s*${yearRegexFragment}$`, "i"),
    ];

    return {
      $or: [
        {
          $or: fresherConditions.map((regex) => ({ experienceInRange: regex })),
        },
        {
          $or: fresherConditions.map((regex) => ({ experience: regex })),
        },
      ],
    };
  }

  // If the value contains a hyphen (range format like "0-9")
  if (value.includes("-")) {
    const [min, max] = value.split("-").map((num) => parseInt(num.trim()));

    if (!isNaN(min) && !isNaN(max)) {
      const rangeRegex = new RegExp(
        `^(${min}|${max}|${min}-${max}|${max}-${min})\\s*${yearRegexFragment}$`,
        "i"
      );
      return {
        $or: [{ experienceInRange: rangeRegex }, { experience: rangeRegex }],
      };
    }
  }

  // If it's a single number (like "4")
  const num = parseInt(value);
  if (!isNaN(num)) {
    const conditions = [
      // Exact match: "4 years", "4yrs", "4yr", "4y"
      new RegExp(`^${num}\\s*${yearRegexFragment}$`, "i"),
      // Range match starting with the number: "4-6 years"
      new RegExp(`^${num}-\\d+\\s*${yearRegexFragment}$`, "i"),
      // Range match ending with the number: "2-4 years"
      new RegExp(`^\\d+-${num}\\s*${yearRegexFragment}$`, "i"),
      // Match with plus: "4+ years", "4+yrs", "4+yr", "4+y"
      new RegExp(`^${num}\\+\\s*${yearRegexFragment}$`, "i"),
    ];

    return {
      $or: [
        {
          $or: [
            ...fresherConditions.map((regex) => ({ experienceInRange: regex })),
            { experienceRange: "" }, // Add an empty string match for experienceRange
          ],
        },
        {
          $or: [
            ...fresherConditions.map((regex) => ({ experience: regex })),
            { experience: "" }, // Add an empty string match for experience
          ],
        },
      ],
    };
  }

  // For any other text value
  const textRegex = new RegExp(value, "i");
  return {
    $or: [{ experienceInRange: textRegex }, { experience: textRegex }],
  };
};

module.exports = {
  modifyDateFilter,
  modifyTwoDatesFilter,
  modifyPostingDateFilter,
  modifyDeadlineDateFilter,
  createArrayRegexFilter,
  createRegexFilter,
  processSalaryRange,
  isValidSalaryRange,
  normalizeSalaryRange,
  createSalaryRangeFilter,
  doSalaryRangesOverlap,
  createExperienceRangeFilter,
};

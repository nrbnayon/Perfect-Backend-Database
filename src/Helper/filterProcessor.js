const { default: mongoose } = require("mongoose");
const {
  modifyDateFilter,
  modifyTwoDatesFilter,
  modifyPostingDateFilter,
  modifyDeadlineDateFilter,
  createArrayRegexFilter,
  createRegexFilter,
  createSalaryRangeFilter,
  createExperienceRangeFilter,
} = require("./modifyDateFilter");

// Helper function to process filters
const processFilters = (filters, fieldsToModify) => {
  const orConditions = [];

  Object.entries(filters).forEach(([key, value]) => {
    console.log("Processing Key:", key);
    console.log("Processing Value:", value);

    if (value) {
      if (shouldModifyFilter(key, fieldsToModify)) {
        const modifiedFilter = modifyFilter(key, value);
        if (modifiedFilter) {
          orConditions.push(modifiedFilter);
        }
      } else {
        orConditions.push({ [key]: createArrayRegexFilter(value) });
      }
    }
  });

  // Return $or condition if there are filters, empty object otherwise
  return orConditions.length > 0 ? { $or: orConditions } : {};
};

// Helper function to check if a filter needs modification
const shouldModifyFilter = (key, fieldsToModify) => {
  return fieldsToModify.some(
    (field) => key.toLowerCase() === field.toLowerCase()
  );
};

// Main function to modify filters based on key
const modifyFilter = (key, value) => {
  console.log(`Modifying filter - Key: ${key}, Value:`, value);

  switch (key.toLowerCase()) {
    case "workmode":
    case "jobtype":
      console.log(`Creating array regex filter for ${key}`);
      // Handle both array and single value cases
      const values = Array.isArray(value) ? value : [value];
      return { [key]: createArrayRegexFilter(values) };

    case "vendorinfo":
      return { "vendorInfo.companyType": createArrayRegexFilter(value) };

    case "categoryinfo":
      console.log("Creating category filter for value:", value);
      return {
        $or: [
          {
            "categoryInfo.categoryName": createRegexFilter(value),
          },
          {
            categories: mongoose.Types.ObjectId.isValid(value)
              ? new mongoose.Types.ObjectId(value)
              : value,
          },
        ],
      };

    case "salaryrange":
      return createSalaryRangeFilter(value);

    case "address":
      const locationPattern = new RegExp(value, "i");
      return {
        $or: [
          { location: locationPattern },
          { "vendorInfo.address": locationPattern },
          { "vendorInfo.location": locationPattern },
          { "vendorInfo.city": locationPattern },
          { "vendorInfo.district": locationPattern },
        ],
      };

    case "date":
      return modifyDateFilter(key, value);
    case "daterange":
      return modifyTwoDatesFilter(key, value);
    case "q":
      return null;
    // case "q":
    //   return {
    //     $or: [
    //       { postName: new RegExp(value, "i") },
    //       { description: new RegExp(value, "i") },
    //       { "vendorInfo.vendorName": new RegExp(value, "i") },
    //     ],
    //   };
    case "exp":
      return createExperienceRangeFilter(value);
    case "location":
      return { location: new RegExp(value, "i") };
    case "postingdate":
      return modifyPostingDateFilter(key, value);
    case "deadline":
      return modifyDeadlineDateFilter(key, value);

    default:
      console.log(`No specific handler for key: ${key}`);
      return { [key]: createArrayRegexFilter(value) };
  }
};

module.exports = { processFilters };

// const { default: mongoose } = require("mongoose");
// const {
//   modifyDateFilter,
//   modifyTwoDatesFilter,
//   modifyPostingDateFilter,
//   modifyDeadlineDateFilter,
//   createArrayRegexFilter,
//   createRegexFilter,
// } = require("./modifyDateFilter");

// // Helper function to normalize values

// const processFilters = (filters, fieldsToModify) => {
//   return Object.entries(filters).reduce((acc, [key, value]) => {
//     console.log("get key: " + key);
//     console.log("get value: " + value);
//     if (shouldModifyFilter(key, fieldsToModify)) {
//       return { ...acc, ...modifyFilter(key, value) };
//     }
//     return { ...acc, [key]: createArrayRegexFilter(value) };
//   }, {});
// };

// // Helper function to parse experienceRange strings
// // const parseExperienceRange = (value) => {
// //   const match = value.match(/(\d+)-(\d+)/);
// //   if (match) {
// //     const [_, min, max] = match;
// //     return { min: parseInt(min, 10), max: parseInt(max, 10) };
// //   }
// //   return null;
// // };

// const processedFilters = processFilters(filters, fieldsToModify);
// console.log("Processed Filters:", processedFilters);

// const shouldModifyFilter = (key, fieldsToModify) => {
//   return fieldsToModify.some(
//     (field) => key.toLowerCase() === field.toLowerCase()
//   );
// };

// const modifyFilter = (key, value) => {
//   console.log(`Modifying filter - Key: ${key}, Value:`, value);

//   switch (key.toLowerCase()) {
//     case "workmode": {
//       console.log(`Create filter workmode - Key: ${key}, Value:`, value);

//       return {
//         [key]: createArrayRegexFilter(value),
//       };
//     }

//     case "jobtype": {
//       console.log(`Create filter job type - Key: ${key}, Value:`, value);

//       return {
//         [key]: createArrayRegexFilter(value),
//       };
//     }
//     case "vendorinfo": {
//       return {
//         "vendorInfo?.companyType": createArrayRegexFilter(value),
//       };
//     }

//     case "categoryinfo": {
//       console.log("Creating category filter for value:", value);
//       return {
//         $or: [
//           {
//             "categoryInfo.categoryName": createRegexFilter(value),
//           },
//           {
//             // Also check the categories collection directly
//             categories: mongoose.Types.ObjectId.isValid(value)
//               ? new mongoose.Types.ObjectId(value)
//               : value,
//           },
//         ],
//       };
//     }
//     case "experiencerange": {
//       return processExperienceRange(value);
//     }
//     case "address": {
//       const locationPattern = new RegExp(value, "i");

//       return {
//         $or: [
//           { location: locationPattern },
//           { "vendorInfo.address": locationPattern },
//           { "vendorInfo.location": locationPattern },
//           { "vendorInfo.city": locationPattern },
//           { "vendorInfo.district": locationPattern },
//         ],
//         $text: {
//           $search: locationPattern,
//         },
//       };
//     }
//     case "salaryRange": {
//       const [min, max] = value.split("-").map(Number);
//       return {
//         $and: [
//           {
//             $or: [{ minSalary: { $gte: min } }, { maxSalary: { $gte: min } }],
//           },
//           {
//             $or: [{ minSalary: { $lte: max } }, { maxSalary: { $lte: max } }],
//           },
//         ],
//       };
//     }

//     case "date":
//       return modifyDateFilter(key, value);

//     case "daterange":
//       return modifyTwoDatesFilter(key, value);

//     case "q":
//       return null;

//     case "exp": {
//       return {
//         experienceRange: createRegexFilter(value),
//       };
//     }

//     case "location": {
//       return {
//         location: createRegexFilter(value),
//       };
//     }

//     case "postingdate":
//       return modifyPostingDateFilter(key, value);

//     case "deadline":
//       return modifyDeadlineDateFilter(key, value);

//     default: {
//       return {
//         [key]: createArrayRegexFilter(value),
//       };
//     }
//   }
// };

// module.exports = { processFilters };

// const processExperienceRange = (range) => {
//   // Extract numbers from the range (e.g., "0-6" -> [0, 6])
//   const [minExp, maxExp] = range.split("-").map(Number);

//   // Create a query that checks if the stored experience range overlaps with the requested range
//   return {
//     $or: [
//       // Handle ranges stored as "X-Y years"
//       {
//         experienceRange: {
//           $regex: new RegExp(`\\d+-\\d+\\s*years?`, "i"),
//         },
//         $expr: {
//           $let: {
//             vars: {
//               // Extract numbers from stored range using regex
//               range: {
//                 $regexFind: {
//                   input: "$experienceRange",
//                   regex: "(\\d+)-(\\d+)",
//                 },
//               },
//             },
//             in: {
//               $and: [
//                 // Check if the stored range overlaps with requested range
//                 {
//                   $lte: [
//                     { $toInt: { $arrayElemAt: ["$$range.captures", 0] } },
//                     maxExp,
//                   ],
//                 },
//                 {
//                   $gte: [
//                     { $toInt: { $arrayElemAt: ["$$range.captures", 1] } },
//                     minExp,
//                   ],
//                 },
//               ],
//             },
//           },
//         },
//       },
//       // Handle single number ranges (e.g., "5 years")
//       {
//         experienceRange: {
//           $regex: new RegExp(`^\\d+\\s*years?$`, "i"),
//         },
//         $expr: {
//           $let: {
//             vars: {
//               years: {
//                 $toInt: {
//                   $regexFind: {
//                     input: "$experienceRange",
//                     regex: "(\\d+)",
//                   }.captures[0],
//                 },
//               },
//             },
//             in: {
//               $and: [
//                 { $gte: ["$$years", minExp] },
//                 { $lte: ["$$years", maxExp] },
//               ],
//             },
//           },
//         },
//       },
//     ],
//   };
// };

// /* eslint-disable node/no-unsupported-features/es-syntax */
// const {
//   modifyDateFilter,
//   modifyTwoDatesFilter,
//   modifyPostingDateFilter,
//   modifyDeadlineDateFilter,
// } = require("./modifyDateFilter");

// // const processFilters = (filters, fieldsToModify) => {
// //   console.log("filters :", filters);
// //   return filters?.map((filter) => {
// //     const [key, value] = Object.entries(filter)[0];
// //     if (shouldModifyFilter(key, fieldsToModify)) {
// //       return modifyFilter(key, value);
// //     }
// //     return filter;
// //   });
// // };

// const normalizeValue = (value) => {
//   if (typeof value === "string") {
//     return value.trim().toLowerCase().replace(/\s+/g, "-"); // Replace one or more spaces with a single hyphen
//   }
//   return value;
// };

// // Helper function to normalize array values
// const normalizeArrayValues = (values) => {
//   if (Array.isArray(values)) {
//     return values.map(normalizeValue);
//   }
//   return normalizeValue(values);
// };

// const processFilters = (filters, fieldsToModify) => {
//   return Object.entries(filters).reduce((acc, [key, value]) => {
//     if (shouldModifyFilter(key, fieldsToModify)) {
//       return { ...acc, ...modifyFilter(key, value) };
//     }
//     return { ...acc, [key]: value };
//   }, {});
// };
// const shouldModifyFilter = (key, fieldsToModify) => {
//   return fieldsToModify.some(
//     (field) => key.toLowerCase() === field.toLowerCase()
//   );
// };

// const modifyFilter = (key, value) => {
//   switch (key.toLowerCase()) {
//     case "date":
//       return modifyDateFilter(key, value);
//     case "daterange":
//       return modifyTwoDatesFilter(key, value);
//     case "q":
//       return null;
//     // case "q":
//     //   return {
//     //     $or: [
//     //       { postName: new RegExp(value, "i") },
//     //       { description: new RegExp(value, "i") },
//     //       { "vendorInfo.vendorName": new RegExp(value, "i") },
//     //     ],
//     //   };
//     case "exp":
//       return { experienceRange: new RegExp(value, "i") };
//     case "location":
//       return { location: new RegExp(value, "i") };
//     case "postingdate":
//       return modifyPostingDateFilter(key, value);
//     case "deadline":
//       return modifyDeadlineDateFilter(key, value);
//     case "workmode": {
//       const normalizedValues = normalizeArrayValues(value);
//       return {
//         [key]: Array.isArray(normalizedValues)
//           ? { $in: normalizedValues }
//           : normalizedValues,
//       };
//     }

//     case "jobtype": {
//       const normalizedValues = normalizeArrayValues(value);
//       return {
//         [key]: Array.isArray(normalizedValues)
//           ? { $in: normalizedValues }
//           : normalizedValues,
//       };
//     }

//     case "categoryinfo": {
//       const normalizedValues = normalizeArrayValues(value);
//       return {
//         categories: Array.isArray(normalizedValues)
//           ? { $in: normalizedValues }
//           : normalizedValues,
//       };
//     }

//     default:
//       return { [key]: value };
//   }
// };

// module.exports = { processFilters };

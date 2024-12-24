const createSearchQuery = (searchTerm, searchableFields) => {
  if (!searchTerm) return []; // Early return if no search term
  // console.log(" search helper term: ", searchTerm);

  const terms = searchTerm.split(/\s+|&/); // Split by spaces or '&'

  const searchQueries = [];

  terms.forEach((term) => {
    const searchRegex = { $regex: term, $options: "i" };

    searchableFields.forEach((field) => {
      // Handling different field types
      switch (field) {
        case "vendorInfo":
          searchQueries.push(
            { "vendorInfo.vendorName": searchRegex },
            { "vendorInfo.email": searchRegex },
            { "vendorInfo.location": searchRegex }
          );
          break;
        case "categoryInfo":
          searchQueries.push({ "categoryInfo.categoryName": searchRegex });
          break;
        case "requiredCoreSkills":
        case "preferredSkills":
        case "customSkills":
          searchQueries.push({ [field]: searchRegex });
          break;
        case "salaryRange":
        case "experienceRange": {
          const rangeMatch = term.match(/(\d+)-(\d+)/); // Match the range pattern
          if (rangeMatch) {
            const [_, min, max] = rangeMatch;
            searchQueries.push({
              [field]: { $gte: parseInt(min), $lte: parseInt(max) },
            });
          } else {
            searchQueries.push({ [field]: searchRegex }); // Fallback to regex if no valid range
          }
          break;
        }
        default:
          searchQueries.push({ [field]: searchRegex }); // Default text field handling
      }
    });
  });

  return searchQueries; // Returning array to be used in $or
};

exports.searchHelper = {
  createSearchQuery,
};

// const createSearchQuery = (searchTerm, searchableFields) => {
//   if (!searchTerm) return []; // Early return if no search term
//   console.log("first search term: search Helper", searchTerm);
//   const terms = searchTerm.split(/\s+|&/); // Split by spaces or '&'

//   const searchQueries = terms.flatMap((term) => {
//     const searchRegex = { $regex: term, $options: "i" };
//     return searchableFields.map((field) => {
//       // Handling different field types
//       if (field === "vendorInfo") {
//         return {
//           $or: [
//             { "vendorInfo.vendorName": searchRegex },
//             { "vendorInfo.email": searchRegex },
//             { "vendorInfo.location": searchRegex },
//           ],
//         };
//       }
//       if (field === "categoryInfo") {
//         return { "categoryInfo.categoryName": searchRegex };
//       }
//       if (
//         ["requiredCoreSkills", "preferredSkills", "customSkills"].includes(
//           field
//         )
//       ) {
//         return { [field]: searchRegex };
//       }
//       if (["salaryRange", "experienceRange"].includes(field)) {
//         const [min, max] = term.split("-");
//         return min && max
//           ? { [field]: { $gte: parseInt(min), $lte: parseInt(max) } }
//           : { [field]: searchRegex };
//       }
//       // Default text field handling
//       return { [field]: searchRegex };
//     });
//   });

//   return searchQueries; // Returning array to be used in $or
// };
// exports.searchHelper = {
//   createSearchQuery,
// };

// // Define a generic search function
// const createSearchQuery = (searchTerm, searchableFields) => {
//   if (searchTerm) {
//     const searchRegex = {
//       $regex: searchTerm,
//       $options: "i",
//     };

//     const searchQuery = searchableFields.map((field) => ({
//       [field]: searchRegex,
//     }));

//     return searchQuery;
//   } else {
//     // Return an empty query if searchTerm is not provided
//     return [];
//   }
// };

// exports.searchHelper = {
//   createSearchQuery,
// };
// Demo call for users
//   const userSearchableFields = ['name', 'email', 'username'];
//   const userSearchTerm = 'userSearchTermHere';
//   const userQuery = createSearchQuery(userSearchTerm, userSearchableFields);
//   console.log(userQuery, 'searchQuery');

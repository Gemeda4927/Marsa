// helpers/filterHelper.js

/**
 * Builds a MongoDB filter object from query parameters
 * Supports advanced filtering operators (gt, gte, lt, lte, ne, in)
 * Removes special fields not meant for filtering
 * Adds search filtering on title and description if search term is provided
 * Also handles popular/mostPurchased aliasing (sorting and limiting)
 */
const buildFilter = (query) => {
  const filter = { ...query };
  const excludeFields = ['page', 'sort', 'limit', 'fields', 'search', 'mostPurchased', 'popular'];
  excludeFields.forEach(el => delete filter[el]);

  // Convert query operators to MongoDB operators
  let filterStr = JSON.stringify(filter);
  filterStr = filterStr.replace(/\b(gt|gte|lt|lte|ne|in)\b/g, match => `$${match}`);

  return JSON.parse(filterStr);
};

module.exports = { buildFilter };

class APIFeatures {
  /**
   * @param {Mongoose.Query} query - The Mongoose query object.
   * @param {Object} queryString - The query parameters from req.query / URLSearchParams.
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Filtering: basic + advanced (gte, lte, gt, lt) + partial text matches
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Example: map authorID to author
    if (queryObj.authorID) {
      queryObj.author = queryObj.authorID;
      delete queryObj.authorID;
    }

    // Partial matching (case-insensitive) for common fields
    const partialMatchFields = [
      "heading",
      "userName",
      "musicName",
      "minderType",
    ];
    partialMatchFields.forEach((field) => {
      if (queryObj[field]) {
        queryObj[field] = { $regex: queryObj[field], $options: "i" };
      }
    });

    // Advanced filtering: convert gte, gt, lte, lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  // Field limiting
  limitFields(defaultFields = null) {
    // If client requests specific fields via ?fields=title,slug,author
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(",");
      // Optionally exclude system/internal fields
      const excludeFields = ["followers", "following", "__v"];
      fields = fields.filter((f) => !excludeFields.includes(f));
      this.query = this.query.select(fields.join(" "));
    } else if (defaultFields) {
      // If defaultFields are passed from route, use them
      this.query = this.query.select(defaultFields.join(" "));
    } else {
      // Default exclusion
      this.query = this.query.select("-followers -following -__v");
    }
    return this;
  }

  // Pagination
  paginate() {
    const page = Math.max(1, parseInt(this.queryString.page) || 1);
    const limit = Math.max(1, parseInt(this.queryString.limit) || 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;

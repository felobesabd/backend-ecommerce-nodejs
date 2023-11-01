class ApiFeature {
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }

    filter() {
        const filterQuery = { ...this.queryString }
        const excludesField = ['page', 'limit', 'sort', 'field', 'keyword']
        excludesField.forEach((field)=> delete filterQuery[field])

        // filterQuery => { price: { gte: '100' }, ratingsAverage: { gte: '4' } }
        let querStr = JSON.stringify(filterQuery)
        querStr = querStr.replace(/\b(gte|gt|lte|lt)\b/g, (match)=> `$${match}`)
        // queryParse => { price: { '$gte': '100' }, ratingsAverage: { '$gte': '4' } }

        this.mongooseQuery = this.mongooseQuery.find(JSON.parse(querStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.mongooseQuery = this.mongooseQuery.sort(sortBy)
        } else {
            this.mongooseQuery = this.mongooseQuery.sort("-createdAt")
        }
        return this;
    }

    limitFields() {
        if (this.queryString.field) {
            const fields = this.queryString.field.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.select(fields);
        } else {
            this.mongooseQuery = this.mongooseQuery.select('-__v');
        }
        return this;
    }

    search(modelName) {
        if (this.queryString.keyword) {
            let query = {};
            if (modelName === 'product') {
                query.$or = [
                    { title: { $regex: this.queryString.keyword, $options: 'i' }},
                    { description: { $regex: this.queryString.keyword, $options: 'i' }}
                ]
            } else {
                query = { name: { $regex: this.queryString.keyword, $options: 'i' }}
            }
            this.mongooseQuery = this.mongooseQuery.find(query)
        } else {
            this.mongooseQuery = this.mongooseQuery.select('-__v')
        }
        return this;
    }

    paginate(countDocuments) {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 50;
        const skip = (page - 1) * limit;
        const endIndex = page * limit;

        // pagination result
        const pagination = {};
        pagination.limit = limit;
        pagination.currentPage = page;
        pagination.numberOfPages = Math.ceil(countDocuments / limit);

        // next
        if (endIndex < countDocuments) {
            pagination.next = page + 1;
        }
        // prev
        if (skip > 0) {
            pagination.prev = page - 1;
        }

        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit)
        this.paginationResult = pagination;

        return this;
    }
}

module.exports = ApiFeature;
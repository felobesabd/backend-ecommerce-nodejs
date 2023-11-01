const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: [3, 'Too short product title'],
            maxlength: [100, 'Too long product title'],
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            minlength: [20, 'Too short product description'],
        },
        quantity: {
            type: Number,
            required: [true, 'Product quantity is required'],
        },
        sold: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            trim: true,
            max: [200000, 'Too long product price'],
        },
        priceAfterDiscount: {
            type: Number,
        },
        colors: [String],

        imageCover: {
            type: String,
            required: [true, 'Product Image cover is required'],
        },
        images: [String],
        category: {
            type: mongoose.Schema.ObjectId,
            ref: 'category',
            required: [true, 'Product must be belong to category'],
        },
        subcategories: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'subCategory',
            },
        ],
        brand: {
            type: mongoose.Schema.ObjectId,
            ref: 'Brand',
        },
        ratingsAverage: {
            type: Number,
            min: [1, 'Rating must be above or equal 1.0'],
            max: [5, 'Rating must be below or equal 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const setImage = (doc)=> {
    if (doc.imageCover) {
        const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`
        doc.imageCover = imageUrl;
    }
    if (doc.images) {
        const imageList = [];
        doc.images.forEach((item)=> {
            const imageUrl = `${process.env.BASE_URL}/products/${item}`
            imageList.push(imageUrl);
        })
        doc.images = imageList;
    }
}


// getAll, getOne and UpdateOne
productSchema.post("init", (doc)=> {
    setImage(doc)
})

// Create
productSchema.post("save", (doc)=> {
    setImage(doc)
})

const productModel = new mongoose.model('product', productSchema);

module.exports = productModel;
const mongoose = require("mongoose");

// 1- Create Schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category required'],
        unique: [true, 'Category must be unique'],
        minlength: [3, 'Too short category name'],
        maxlength: [32, 'Too long category name'],
    },
    // A and B => shoping.com/a-and-b
    slug: {
        type: String,
        lowercase: true,
    },
    image: String
},
    { timestamps: true })


const setImage = (doc)=> {
    if (doc.image) {
        const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`
        doc.image = imageUrl;
    }
}
// getAll, getOne and UpdateOne
categorySchema.post("init", (doc)=> {
    setImage(doc)
})

// Create
categorySchema.post("save", (doc)=> {
    setImage(doc)
})

// 2- Create Model
const categoryModel = new mongoose.model('category', categorySchema)

module.exports = categoryModel;
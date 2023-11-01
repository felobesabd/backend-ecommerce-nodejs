const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'brand required'],
        unique: [true, 'brand must be unique'],
        minlength: [3, 'Too short brand name'],
        maxlength: [32, 'Too long brand name'],
    },
    slug: {
        type: String,
        lowercase: true,
    },
    image: String,
},
    { timestamps: true })

const setImageURL = (doc)=> {
    if (doc.image) {
        const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`
        doc.image = imageUrl;
    }
}
// getAll, getOne and UpdateOne
brandSchema.post("init", (doc)=> {
    setImageURL(doc)
})

// Create
brandSchema.post("save", (doc)=> {
    setImageURL(doc)
})

const brandModel = new mongoose.model('brand', brandSchema)

module.exports = brandModel;
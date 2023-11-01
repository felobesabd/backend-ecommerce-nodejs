const multer = require("multer");
const ApiError = require("../utils/apiError");

// The disk storage engine
// const storage = multer.diskStorage({
//     destination:  (req, file, cb) => {
//         cb(null, 'uploads/categories')
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         const fileName = `category-${uuidv4()}-${Date.now()}.${ext}`
//         cb(null, fileName)
//     }
// })

const uploadImage = ()=> {
// The memory storage engine
    const storage = multer.memoryStorage()

    const fileFiltering = (req, file, cb)=> {
        if (file.mimetype.startsWith('image')) {
            cb(null, true)
        } else {
            cb(new ApiError(`Only images allowed`, 400), false)
        }
    }

    const upload = multer({ storage: storage, fileFilter: fileFiltering })

    return upload;
}

exports.uploadSingleImage = (fieldName)=> uploadImage().single(fieldName)

exports.uploadMaltiOfImage = (arrayOfFields)=> uploadImage().fields(arrayOfFields)
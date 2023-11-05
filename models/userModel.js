const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'name required'],
        },
        slug: {
            type: String,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, 'email required'],
            unique: true,
            lowercase: true,
        },
        phone: String,
        profileImg: String,

        password: {
            type: String,
            required: [true, 'password required'],
            minlength: [6, 'Too short password'],
        },

        passChangedAt: Date,
        passResetCode: String,
        passResetExpired: Date,
        passResetVerified: Boolean,

        role: {
            type: String,
            enum: ['user', 'manager', 'admin'],
            default: 'user',
        },
        active: {
            type: Boolean,
            default: true,
        },
        wishlist: [{
            type: mongoose.Schema.ObjectId,
            ref: 'product'
        }],
        addresses: [
            {
                id: { type: mongoose.Schema.Types.ObjectId },
                alias: String,
                details: String,
                phone: String,
                city: String,
                postalCode: String,
            },
        ],
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    // console.log('normal', this);
    if (!this.isModified('password')) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const userModel = new mongoose.model('User', userSchema);

module.exports = userModel;
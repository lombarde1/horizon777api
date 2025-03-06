const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true
    },
    balance: {
        type: Number,
        default: 0.00,
        min: [0, 'Balance cannot be negative']
    },
    settings: {
        language: {
            type: String,
            default: 'pt-br',
            enum: ['pt-br', 'en', 'es', 'ar']
        },
        notifications: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            default: 'dark',
            enum: ['dark', 'light']
        }
    },
    lastLogin: {
        type: Date
    },
    bonusUsed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
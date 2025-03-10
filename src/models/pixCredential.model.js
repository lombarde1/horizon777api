const mongoose = require('mongoose');

const pixCredentialSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true
    },
    clientSecret: {
        type: String,
        required: true
    },
    baseUrl: {
        type: String,
        required: true,
        default: 'https://api.a.com/v2'
    },
    webhookUrl: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
pixCredentialSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('PixCredential', pixCredentialSchema);
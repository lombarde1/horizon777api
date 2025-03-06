const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Game name is required'],
        unique: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    provider: {
        type: String
    },
    category: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
gameSchema.index({ category: 1 });
gameSchema.index({ isActive: 1 });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
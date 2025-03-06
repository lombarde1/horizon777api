const mongoose = require('mongoose');

const INACTIVE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

const dinoGameSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'ended'],
        default: 'active'
    },
    score: {
        type: Number,
        default: 0
    },
    speed: {
        type: Number,
        default: 1
    },
    earnedAmount: {
        type: Number,
        default: 0
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    lastUpdateTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
dinoGameSchema.index({ userId: 1, status: 1 });
dinoGameSchema.index({ userId: 1, createdAt: -1 });

// Method to check and terminate inactive games
dinoGameSchema.statics.terminateInactiveGames = async function() {
    const inactiveTime = new Date(Date.now() - INACTIVE_TIMEOUT);
    
    const inactiveGames = await this.find({
        status: 'active',
        lastUpdateTime: { $lt: inactiveTime }
    });

    for (const game of inactiveGames) {
        game.status = 'ended';
        game.endTime = new Date();
        await game.save();

        // Create loss penalty transaction
        const lossPenalty = Math.ceil(game.earnedAmount * 0.5);
        if (lossPenalty > 0) {
            const Transaction = mongoose.model('Transaction');
            const lossTransaction = new Transaction({
                userId: game.userId,
                type: 'BET',
                amount: lossPenalty,
                description: `Dino Rex game auto-terminated due to inactivity - Score: ${game.score}`,
                status: 'COMPLETED',
                game: 'Dino Rex'
            });
            await lossTransaction.save();
        }
    }

    return inactiveGames.length;
};

const DinoGame = mongoose.model('DinoGame', dinoGameSchema);

module.exports = DinoGame;
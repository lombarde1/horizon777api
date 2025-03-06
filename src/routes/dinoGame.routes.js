const express = require('express');
const router = express.Router();

// Check for inactive games every minute
setInterval(async () => {
    try {
        const terminatedCount = await DinoGame.terminateInactiveGames();
        if (terminatedCount > 0) {
            console.log(`Auto-terminated ${terminatedCount} inactive Dino Rex games`);
        }
    } catch (error) {
        console.error('Error in auto-termination check:', error);
    }
}, 60000); // Run every minute
const DinoGame = require('../models/dinoGame.model');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const { verifyToken } = require('../middleware/auth');

// Start a new game
router.post('/start', verifyToken, async (req, res) => {
    try {
        // Check if user has any active games and end them
        const activeGame = await DinoGame.findOne({
            userId: req.user.id,
            status: 'active'
        });

        if (activeGame) {
            // End the active game as a loss
            activeGame.status = 'ended';
            activeGame.endTime = new Date();
            await activeGame.save();

            // Calculate and apply loss penalty (50% of earned amount)
            const lossPenalty = Math.ceil(activeGame.earnedAmount * 0.5);
            if (lossPenalty > 0) {
                const lossTransaction = new Transaction({
                    userId: req.user.id,
                    type: 'BET',
                    amount: lossPenalty,
                    description: `Dino Rex game auto-terminated - Score: ${activeGame.score}`,
                    status: 'COMPLETED',
                    game: 'Dino Rex'
                });
                await lossTransaction.save();

                // Deduct loss penalty from user's balance
                await User.findByIdAndUpdate(req.user.id, {
                    $inc: { balance: -lossPenalty }
                });
            }

            // Process remaining earnings
            const remainingEarnings = activeGame.earnedAmount - lossPenalty;
            if (remainingEarnings > 0) {
                const winTransaction = new Transaction({
                    userId: req.user.id,
                    type: 'WIN',
                    amount: remainingEarnings,
                    description: `Dino Rex game earnings - Score: ${activeGame.score}`,
                    status: 'COMPLETED',
                    game: 'Dino Rex'
                });
                await winTransaction.save();

                // Update user balance with remaining earnings
                await User.findByIdAndUpdate(req.user.id, {
                    $inc: { balance: remainingEarnings }
                });
            }
        }

        // Check if user exists
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Create new game session
        const game = new DinoGame({
            userId: req.user.id
        });

        await game.save();
        res.status(201).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Handle jump action and update game state
router.post('/:gameId/jump', verifyToken, async (req, res) => {
    try {
        const game = await DinoGame.findOne({
            _id: req.params.gameId,
            userId: req.user.id,
            status: 'active'
        });

        if (!game) {
            return res.status(404).json({ message: 'Active game not found' });
        }

        // Update game state
        game.speed += 0.2; // Small speed increase with each jump
        game.score += 1;
        game.earnedAmount += Math.ceil(game.speed * 0.01); // Earn 1-2 cents per jump based on current speed
        game.lastUpdateTime = new Date();

        // Check if player reached victory score (100)
        if (game.score >= 100) {
            // Update game status for victory
            game.status = 'ended';
            game.endTime = new Date();

            // Create transaction for full earnings (no penalty for victory)
            const winTransaction = new Transaction({
                userId: req.user.id,
                type: 'WIN',
                amount: game.earnedAmount,
                description: `Dino Rex game victory! Final Score: ${game.score}`,
                status: 'COMPLETED',
                game: 'Dino Rex'
            });

            await Promise.all([
                game.save(),
                winTransaction.save(),
                User.findByIdAndUpdate(req.user.id, {
                    $inc: { balance: game.earnedAmount }
                })
            ]);

            return res.json({
                ...game.toObject(),
                victory: true
            });
        }

        await game.save();
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// End game (collision)
router.post('/:gameId/end', verifyToken, async (req, res) => {
    try {
        const game = await DinoGame.findOne({
            _id: req.params.gameId,
            userId: req.user.id,
            status: 'active'
        });

        if (!game) {
            return res.status(404).json({ message: 'Active game not found' });
        }

        // Update game status
        game.status = 'ended';
        game.endTime = new Date();

        // Only process loss penalty if there are earnings
        if (game.earnedAmount > 0) {
            // Calculate loss penalty (50% of earned amount)
            const lossPenalty = Math.ceil(game.earnedAmount * 0.5);

            // Create transaction for loss penalty
            const lossTransaction = new Transaction({
                userId: req.user.id,
                type: 'BET',
                amount: lossPenalty,
                description: `Dino Rex game loss penalty - Score: ${game.score}`,
                status: 'COMPLETED',
                game: 'Dino Rex'
            });

            // Save game state and create loss transaction
            await Promise.all([
                game.save(),
                lossTransaction.save(),
                User.findByIdAndUpdate(req.user.id, {
                    $inc: { balance: -lossPenalty }
                })
            ]);

            return res.json({
                ...game.toObject(),
                penaltyAmount: lossPenalty
            });
        }

        // If no earnings, just save the game state
        await game.save();
        res.json({
            ...game.toObject(),
            penaltyAmount: 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's game history
router.get('/history', verifyToken, async (req, res) => {
    try {
        const games = await DinoGame.find({
            userId: req.user._id
        }).sort({ createdAt: -1 }).limit(10);

        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current active game
router.get('/active', verifyToken, async (req, res) => {
    try {
        const game = await DinoGame.findOne({
            userId: req.user.id,
            status: 'active'
        });

        if (!game) {
            return res.status(404).json({ message: 'No active game found' });
        }

        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
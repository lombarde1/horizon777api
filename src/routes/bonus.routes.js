const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const { verifyToken } = require('../middleware/auth');

// Claim bonus endpoint
router.post('/claim', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has already used the bonus
        if (user.bonusUsed) {
            return res.status(400).json({ message: 'Bonus already claimed' });
        }

        // Check if user has any balance to apply bonus
        if (user.balance <= 0) {
            return res.status(400).json({ message: 'No balance available to apply bonus' });
        }

        const previousBalance = user.balance;
        const targetBalance = 420;
        const bonusAmount = targetBalance - previousBalance;

        // Create bonus transaction
        const transaction = new Transaction({
            userId: user._id,
            type: 'BONUS',
            amount: bonusAmount,
            status: 'COMPLETED',
            metadata: {
                previousBalance: previousBalance,
                newBalance: targetBalance
            }
        });

        // Update user balance and mark bonus as used
        user.balance = targetBalance;
        user.bonusUsed = true;

        // Save both user and transaction
        await Promise.all([
            user.save(),
            transaction.save()
        ]);

        res.json({
            message: 'Bonus claimed successfully',
            previousBalance: previousBalance,
            currentBalance: user.balance
        });

    } catch (error) {
        console.error('Bonus claim error:', error);
        res.status(500).json({ message: 'Error processing bonus claim' });
    }
});

module.exports = router;
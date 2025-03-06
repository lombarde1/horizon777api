const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const { verifyToken } = require('../middleware/auth');

// Request withdrawal endpoint
router.post('/request', verifyToken, async (req, res) => {
    try {
        const { amount, pixKeyType, pixKey } = req.body;

        // Validate amount and PIX information
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid withdrawal amount' });
        }

        if (!pixKeyType || !pixKey) {
            return res.status(400).json({ message: 'PIX key information is required' });
        }

        // Validate PIX key type
        const validPixKeyTypes = ['CPF', 'EMAIL', 'PHONE', 'RANDOM'];
        if (!validPixKeyTypes.includes(pixKeyType.toUpperCase())) {
            return res.status(400).json({ message: 'Invalid PIX key type' });
        }

        // Get user and check balance
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create withdrawal transaction
        const transaction = new Transaction({
            userId: user._id,
            type: 'WITHDRAWAL',
            amount: amount,
            status: 'PENDING',
            paymentMethod: 'PIX',
            metadata: {
                requestDate: new Date(),
                previousBalance: user.balance,
                pixKeyType: pixKeyType.toUpperCase(),
                pixKey: pixKey
            }
        });

        // Update user balance
        user.balance -= amount;

        // Save both transaction and updated user balance
        await Promise.all([
            transaction.save(),
            user.save()
        ]);

        res.status(201).json({
            message: 'Withdrawal request created successfully',
            transaction_id: transaction._id,
            amount: amount,
            status: 'PENDING',
            remaining_balance: user.balance,
            pix_info: {
                key_type: pixKeyType.toUpperCase(),
                key: pixKey
            }
        });

    } catch (error) {
        console.error('Withdrawal request error:', error);
        res.status(500).json({ message: 'Error processing withdrawal request' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction.model');
const { verifyToken } = require('../middleware/auth');

// Get transaction history
router.get('/history', verifyToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Initiate deposit
router.post('/deposit/initiate', verifyToken, async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const transaction = new Transaction({
            userId: req.user.id,
            type: 'DEPOSIT',
            amount,
            paymentMethod,
            status: 'PENDING'
        });

        await transaction.save();

        // Here you would integrate with a payment provider
        // For now, we'll return a mock payment URL
        res.json({
            message: 'Deposit initiated',
            transaction: transaction._id,
            paymentUrl: `https://payment-provider.com/pay/${transaction._id}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Payment provider callback
router.post('/deposit/callback', async (req, res) => {
    try {
        const { transactionId, status, externalReference } = req.body;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        transaction.status = status;
        transaction.externalReference = externalReference;
        await transaction.save();

        res.json({ message: 'Payment status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Request withdrawal
router.post('/withdrawal/request', verifyToken, async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const transaction = new Transaction({
            userId: req.user.id,
            type: 'WITHDRAWAL',
            amount,
            paymentMethod,
            status: 'PENDING'
        });

        await transaction.save();

        res.json({
            message: 'Withdrawal request submitted',
            transaction: transaction._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
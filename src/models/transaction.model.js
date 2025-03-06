const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    type: {
        type: String,
        required: [true, 'Transaction type is required'],
        enum: ['DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'BONUS']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
        default: 'PENDING'
    },
    paymentMethod: {
        type: String
    },
    externalReference: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

// Middleware to update user balance after transaction status changes to COMPLETED
transactionSchema.pre('save', async function(next) {
    if (this.isModified('status') && this.status === 'COMPLETED') {
        const User = mongoose.model('User');
        const user = await User.findById(this.userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        let balanceChange = 0;
        switch (this.type) {
            case 'DEPOSIT':
            case 'WIN':
                balanceChange = this.amount;
                break;
            case 'WITHDRAWAL':
            case 'BET':
                balanceChange = -this.amount;
                break;
        }

        const newBalance = user.balance + balanceChange;
        if (newBalance < 0) {
            throw new Error('Insufficient balance');
        }

        user.balance = newBalance;
        await user.save();
    }
    next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
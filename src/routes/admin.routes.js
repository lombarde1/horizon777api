const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const Game = require('../models/game.model');

// Middleware to verify admin role
const verifyAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(401).json({ message: 'Admin access required' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error verifying admin role' });
    }
};

// Apply middleware to all routes
router.use(verifyToken, verifyAdmin);

// Withdrawal Management
router.patch('/withdrawals/:transactionId/approve', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.transactionId);
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        if (transaction.type !== 'WITHDRAWAL' || transaction.status !== 'PENDING') {
            return res.status(400).json({ message: 'Invalid transaction for approval' });
        }
        
        transaction.status = 'COMPLETED';
        await transaction.save();
        
        res.json({
            message: 'Withdrawal approved successfully',
            transaction: {
                id: transaction._id,
                status: transaction.status,
                updatedAt: transaction.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error approving withdrawal', error: error.message });
    }
});

router.patch('/withdrawals/:transactionId/reject', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.transactionId);
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        if (transaction.type !== 'WITHDRAWAL' || transaction.status !== 'PENDING') {
            return res.status(400).json({ message: 'Invalid transaction for rejection' });
        }
        
        const user = await User.findById(transaction.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Refund the amount back to user's balance
        user.balance += transaction.amount;
        await user.save();
        
        transaction.status = 'CANCELLED';
        await transaction.save();
        
        res.json({
            message: 'Withdrawal rejected successfully',
            transaction: {
                id: transaction._id,
                status: transaction.status,
                updatedAt: transaction.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting withdrawal', error: error.message });
    }
});

// User Balance Management
router.patch('/users/:userId/balance', async (req, res) => {
    try {
        const { amount, type, reason } = req.body;
        
        if (!amount || !type || !reason) {
            return res.status(400).json({ message: 'Amount, type, and reason are required' });
        }
        
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Create a transaction record
        const transaction = new Transaction({
            userId: user._id,
            type: type.toUpperCase(),
            amount: Math.abs(amount),
            status: 'COMPLETED',
            metadata: { reason, adminId: req.user.id }
        });
        
        // Update user balance
        if (type === 'ADD') {
            user.balance += amount;
        } else if (type === 'SUBTRACT') {
            if (user.balance < amount) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }
            user.balance -= amount;
        } else {
            return res.status(400).json({ message: 'Invalid balance update type' });
        }
        
        await Promise.all([
            user.save(),
            transaction.save()
        ]);
        
        res.json({
            message: 'Balance updated successfully',
            user: {
                id: user._id,
                balance: user.balance,
                updatedAt: user.updatedAt
            },
            transaction: {
                id: transaction._id,
                type: transaction.type,
                amount: transaction.amount,
                status: transaction.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating balance', error: error.message });
    }
});

// Platform Analytics
router.get('/analytics/overview', async (req, res) => {
    try {
        const now = new Date();
        const yesterday = new Date(now - 24 * 60 * 60 * 1000);

        const [totalUsers, activeUsers24h, transactions24h, games] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ last_login: { $gte: yesterday } }),
            Transaction.find({ created_at: { $gte: yesterday } }),
            Game.find({ status: 'active' })
        ]);

        const stats = transactions24h.reduce((acc, t) => {
            if (t.type === 'bet') acc.total_bets++;
            if (t.type === 'withdrawal') acc.total_withdrawals += t.amount;
            if (t.type === 'deposit') acc.total_deposits += t.amount;
            return acc;
        }, { total_bets: 0, total_withdrawals: 0, total_deposits: 0 });

        res.json({
            total_users: totalUsers,
            active_users_24h: activeUsers24h,
            total_bets_24h: stats.total_bets,
            total_withdrawals_24h: stats.total_withdrawals,
            total_deposits_24h: stats.total_deposits,
            active_games: games.length,
            platform_balance: await calculatePlatformBalance()
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics overview' });
    }
});

// Detailed Statistics
router.get('/analytics/statistics', async (req, res) => {
    try {
        const { start_date, end_date, type } = req.query;
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date range' });
        }

        const stats = await getDetailedStatistics(startDate, endDate, type);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching detailed statistics' });
    }
});

// User Management
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const query = {};

        if (status) query.status = status;
        if (search) {
            query.$or = [
                { username: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        const users = await User.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-password');

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_users: total
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Update User Status
router.patch('/users/:userId/status', async (req, res) => {
    try {
        const { status, reason } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { 
                status,
                status_reason: reason,
                updated_at: new Date()
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User status updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user status' });
    }
});

// List All Withdrawal Requests
router.get('/withdrawals', async (req, res) => {
    try {
        const { status = 'PENDING' } = req.query;
        const query = {
            type: 'WITHDRAWAL'
        };

        if (status !== 'ALL') {
            query.status = status;
        }

        const withdrawals = await Transaction.find(query)
            .populate('userId', 'username')
            .sort({ createdAt: -1 });

        res.json({
            withdrawals: withdrawals.map(w => ({
                id: w._id,
                amount: w.amount,
                status: w.status,
                username: w.userId ? w.userId.username : 'Unknown',
                created_at: w.createdAt,
                pix_info: w.metadata?.pixKeyType ? {
                    key_type: w.metadata.pixKeyType,
                    key: w.metadata.pixKey
                } : null
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching withdrawal requests' });
    }
});

// Transaction Management
router.get('/transactions', async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, start_date, end_date } = req.query;
        const query = {};

        if (type) query.type = type;
        if (status) query.status = status;
        if (start_date && end_date) {
            query.created_at = {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            };
        }

        const transactions = await Transaction.find(query)
            .populate('userId', 'username')
            .skip((page - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions: transactions.map(t => ({
                _id: t._id,
                type: t.type,
                amount: t.amount,
                status: t.status,
                username: t.userId ? t.userId.username : 'Unknown'
            })),
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / parseInt(limit)),
                total_transactions: total
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// Update Transaction Status
router.patch('/transactions/:transactionId/status', async (req, res) => {
    try {
        const { status, notes } = req.body;
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.transactionId,
            {
                status,
                admin_notes: notes,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({
            message: 'Transaction status updated successfully',
            transaction
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating transaction status' });
    }
});

// Game Management
router.get('/games', async (req, res) => {
    try {
        const games = await Game.find();
        const gamesWithStats = await Promise.all(games.map(async game => {
            const stats = await getGameStatistics(game._id);
            return {
                ...game.toObject(),
                ...stats
            };
        }));

        res.json({ games: gamesWithStats });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching games' });
    }
});

// Update Game Settings
router.patch('/games/:gameId/settings', async (req, res) => {
    try {
        const { status, min_bet, max_bet, house_edge } = req.body;
        const game = await Game.findByIdAndUpdate(
            req.params.gameId,
            {
                status,
                min_bet,
                max_bet,
                house_edge,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json({
            message: 'Game settings updated successfully',
            game
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating game settings' });
    }
});

// Helper Functions
async function calculatePlatformBalance() {
    const transactions = await Transaction.find();
    return transactions.reduce((balance, t) => {
        if (t.type === 'deposit') return balance + t.amount;
        if (t.type === 'withdrawal' && t.status === 'completed') return balance - t.amount;
        if (t.type === 'bet') {
            if (t.status === 'won') return balance - t.payout;
            if (t.status === 'lost') return balance + t.amount;
        }
        return balance;
    }, 0);
}

async function getDetailedStatistics(startDate, endDate, type) {
    const pipeline = [
        {
            $match: {
                created_at: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                new_users: { $sum: 1 },
                revenue: { $sum: '$amount' }
            }
        },
        { $sort: { '_id': 1 } }
    ];

    const dailyStats = await User.aggregate(pipeline);

    return {
        period: { start: startDate, end: endDate },
        data: {
            daily_stats: dailyStats,
            total_stats: calculateTotalStats(dailyStats)
        }
    };
}

async function getGameStatistics(gameId) {
    const bets = await Transaction.find({
        game_id: gameId,
        type: 'bet'
    });

    return {
        total_bets: bets.length,
        total_wagered: bets.reduce((sum, b) => sum + b.amount, 0),
        total_payout: bets.filter(b => b.status === 'won')
            .reduce((sum, b) => sum + b.payout, 0),
        profit_margin: calculateProfitMargin(bets),
        active_players: new Set(bets.map(b => b.user_id.toString())).size
    };
}

function calculateProfitMargin(bets) {
    const totalWagered = bets.reduce((sum, b) => sum + b.amount, 0);
    const totalPayout = bets.filter(b => b.status === 'won')
        .reduce((sum, b) => sum + b.payout, 0);
    return totalWagered > 0 ? ((totalWagered - totalPayout) / totalWagered) * 100 : 0;
}

function calculateTotalStats(dailyStats) {
    return dailyStats.reduce((totals, day) => ({
        new_users: totals.new_users + day.new_users,
        revenue: totals.revenue + day.revenue,
        profit: totals.profit + (day.revenue * 0.1) // Assuming 10% profit margin
    }), { new_users: 0, revenue: 0, profit: 0 });
}

module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { verifyToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user settings
router.put('/settings', verifyToken, async (req, res) => {
    try {
        const { language, notifications, theme } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update only provided settings
        if (language) user.settings.language = language;
        if (notifications !== undefined) user.settings.notifications = notifications;
        if (theme) user.settings.theme = theme;

        await user.save();

        res.json({
            message: 'Settings updated successfully',
            settings: user.settings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
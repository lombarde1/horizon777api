const express = require('express');
const router = express.Router();
const PixCredential = require('../../models/pixCredential.model');
const { verifyToken } = require('../../middleware/auth');
const User = require('../../models/user.model');
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

// Get current PIX credentials
router.get('/current', async (req, res) => {
    try {
        const credentials = await PixCredential.findOne({ isActive: true });
        if (!credentials) {
            return res.status(404).json({ message: 'No active PIX credentials found' });
        }

        // Remove sensitive data
        const safeCredentials = {
            _id: credentials._id,
            baseUrl: credentials.baseUrl,
            webhookUrl: credentials.webhookUrl,
            isActive: credentials.isActive,
            createdAt: credentials.createdAt,
            updatedAt: credentials.updatedAt
        };

        res.json(safeCredentials);
    } catch (error) {
        console.error('Error fetching PIX credentials:', error);
        res.status(500).json({ message: 'Error fetching PIX credentials' });
    }
});

// Update PIX credentials
router.put('/update', async (req, res) => {
    try {
        const { clientId, clientSecret, baseUrl, webhookUrl } = req.body;

        // Validate required fields
        if (!clientId || !clientSecret || !webhookUrl) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Deactivate current active credentials
        await PixCredential.updateMany(
            { isActive: true },
            { $set: { isActive: false } }
        );

        // Create new credentials
        const newCredentials = new PixCredential({
            clientId,
            clientSecret,
            baseUrl: baseUrl || 'https://api.pixupbr.com/v2',
            webhookUrl,
            isActive: true
        });

        await newCredentials.save();

        // Return safe version of credentials
        const safeCredentials = {
            _id: newCredentials._id,
            baseUrl: newCredentials.baseUrl,
            webhookUrl: newCredentials.webhookUrl,
            isActive: newCredentials.isActive,
            createdAt: newCredentials.createdAt,
            updatedAt: newCredentials.updatedAt
        };

        res.json({
            message: 'PIX credentials updated successfully',
            credentials: safeCredentials
        });
    } catch (error) {
        console.error('Error updating PIX credentials:', error);
        res.status(500).json({ message: 'Error updating PIX credentials' });
    }
});

module.exports = router;
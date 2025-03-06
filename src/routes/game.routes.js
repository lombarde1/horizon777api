const express = require('express');
const router = express.Router();
const Game = require('../models/game.model');
const { verifyToken } = require('../middleware/auth');
const defaultGames = require('../data/defaultGames');

// List all games
router.get('/', async (req, res) => {
    try {
        const games = await Game.find({ isActive: true });
        // Combine database games with default games
        const allGames = [...defaultGames, ...games];
        // Remove duplicates based on name
        const uniqueGames = allGames.filter((game, index, self) =>
            index === self.findIndex((g) => g.name === game.name)
        );
        res.json(uniqueGames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// List featured games
router.get('/featured', async (req, res) => {
    try {
        const dbFeaturedGames = await Game.find({ isActive: true }).limit(6);
        // Get first 6 default games
        const defaultFeaturedGames = defaultGames.slice(0, 6);
        // Combine and remove duplicates
        const allFeaturedGames = [...defaultFeaturedGames, ...dbFeaturedGames];
        const uniqueFeaturedGames = allFeaturedGames.filter((game, index, self) =>
            index === self.findIndex((g) => g.name === game.name)
        ).slice(0, 6);
        res.json(uniqueFeaturedGames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// List game categories
router.get('/categories', async (req, res) => {
    try {
        const dbCategories = await Game.distinct('category', { isActive: true });
        // Get categories from default games
        const defaultCategories = [...new Set(defaultGames.map(game => game.category))];
        // Combine and remove duplicates
        const allCategories = [...new Set([...defaultCategories, ...dbCategories])];
        res.json(allCategories.filter(category => category)); // Filter out null/undefined categories
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get game details
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game || !game.isActive) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
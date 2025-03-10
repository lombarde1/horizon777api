require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const adminRoutes = require('./routes/admin.routes');
const pixCredentialsRoutes = require('./routes/admin/pixCredentials.routes');

const app = express();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://darkvips:lombarde1@147.79.111.143:27017/horizon777';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: 'admin'
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 999999999 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes (to be implemented)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/games', require('./routes/game.routes'));
app.use('/api/bonus', require('./routes/bonus.routes'));
app.use('/api/dino', require('./routes/dinoGame.routes'));
app.use('/api/pix', require('./routes/pix.routes'));
app.use('/api/withdrawal', require('./routes/withdrawal.routes'));
app.use('/api/admin/pix-credentials', pixCredentialsRoutes);

// Register routes
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
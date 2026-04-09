import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

import authRoutes from './routes/authRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'Auth Service is running', timestamp: new Date() });
});

// Routes
app.use('/auth', authRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photo_prestiges_auth';

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

// Database Connection & Server Start
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB for Auth-Service');
        app.listen(PORT, () => {
            console.log(`Auth Service is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    });

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

import authRoutes from './routes/authRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
    res.json({ status: 'Auth service is running', timestamp: new Date() });
});

app.get('/openapi.json', (req, res) => {
    res.json(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photo_prestiges_auth';

if (!process.env.JWT_SECRET) {
    console.error('[Auth-Service] JWT_SECRET is not defined.');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('[Auth-Service] Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`[Auth-Service] Running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('[Auth-Service] Database connection failed:', err.message);
        process.exit(1);
    });


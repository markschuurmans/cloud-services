import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

dotenv.config();

import targetRoutes from './routes/targetRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import errorHandler from './middleware/errorHandler.js';
import startDeadlineConsumer from './messaging/deadlineConsumer.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'src', 'uploads')));

app.get('/health', (req, res) => {
    res.json({ status: 'Target service is running', timestamp: new Date() });
});

app.get('/openapi.json', (req, res) => {
    res.json(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', targetRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photo_prestiges_target';


mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('[Target-Service] Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`[Target-Service] Running on port ${PORT}`);
            startDeadlineConsumer();
        });
    })
    .catch(err => {
        console.error('[Target-Service] Database connection failed:', err.message);
        process.exit(1);
    });


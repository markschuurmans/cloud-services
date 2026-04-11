import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

import scoreRoutes from './routes/scoreRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Score service is running', timestamp: new Date() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', scoreRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photo_prestiges_score';


mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('[Score-Service] Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`[Score-Service] Running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('[Score-Service] Database connection failed:', err.message);
        process.exit(1);
    });

